import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Home() {
  const [mood, setMood] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [history, setHistory] = useState<{ date: string; mood: string; note: string }[]>([])
  const [theme, setTheme] = useState('pink')
  const [user, setUser] = useState<any>(null)
  const [friendsMoods, setFriendsMoods] = useState<any[]>([])

  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/auth')
      } else {
        setUser(data.session.user)
      }
    })
  }, [router])

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const handleSave = async () => {
    if (!mood || !user) return
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase.from('moods').insert([
      {
        user_id: user.id,
        date: today,
        mood,
        note,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error('Error saving mood:', error)
      alert('Something went wrong saving your mood.')
    } else {
      setMood(null)
      setNote('')
      fetchHistory()
    }
  }

  const fetchHistory = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setHistory(data)
    }
  }

  const fetchFriendsMoods = async (userId: string) => {
    const { data: friends } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'accepted')

    const friendIds = friends?.map((f) => f.friend_id) || []
    if (friendIds.length === 0) return

    const { data: moods } = await supabase
      .from('moods')
      .select('*')
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })

    const latestMoods: any[] = []
    const seen = new Set()

    moods?.forEach((m) => {
      if (!seen.has(m.user_id)) {
        latestMoods.push(m)
        seen.add(m.user_id)
      }
    })

    setFriendsMoods(latestMoods)
  }

  useEffect(() => {
    if (user) {
      fetchHistory()
      fetchFriendsMoods(user.id)
    }
  }, [user])

  const moods = ['😊', '😔', '😡', '😴', '😐', '😍', '😭', '🤯']
  const moodColors: { [key: string]: string } = {
    '😊': 'bg-yellow-200',
    '😔': 'bg-blue-200',
    '😡': 'bg-red-200',
    '😴': 'bg-purple-200',
    '😐': 'bg-gray-200',
    '😍': 'bg-pink-200',
    '😭': 'bg-indigo-200',
    '🤯': 'bg-orange-200',
  }

  return (
    <main className={`min-h-screen p-4 flex flex-col items-center text-center relative overflow-hidden ${
      theme === 'pink'
        ? 'bg-gradient-to-b from-pink-50 to-white'
        : theme === 'blue'
        ? 'bg-gradient-to-b from-blue-50 to-white'
        : 'bg-gradient-to-b from-green-50 to-white'
    }`}>
      <div className="absolute w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-30 -z-10 top-10 left-10" />

      <div className="flex flex-col items-center mb-6">
        <h1 className="text-5xl">🧠</h1>
        <h2 className="text-3xl font-bold text-pink-600 mt-1">Feelzy</h2>
        {user && (
          <div className="text-sm text-gray-600 mt-1">
            Hi, {user.email}{' '}
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/auth')
              }}
              className="ml-2 text-pink-500 underline hover:text-pink-700"
            >
              Logout
            </button>
          </div>
        )}
        <p className="text-gray-600 text-sm mt-1 mb-3">Track how you feel — one day at a time</p>

        <div className="flex gap-2">
          {['pink', 'blue', 'green'].map((t) => (
            <button
              key={t}
              onClick={() => handleThemeChange(t)}
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                theme === t ? `bg-${t}-200 border-${t}-400` : 'bg-white'
              }`}
            >
              {t === 'pink' ? 'Blush 🌸' : t === 'blue' ? 'Calm 🌊' : 'Fresh 🍃'}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-gray-700">How are you feeling today?</p>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {moods.map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={`text-3xl p-2 rounded-full bg-white shadow-sm hover:scale-110 transition ${
              mood === m ? 'scale-125 ring-2 ring-pink-400' : ''
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {mood && (
        <div className="mb-4 w-full max-w-md">
          <p className="mb-2 text-gray-700">
            You picked: <span className="text-xl">{mood}</span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a quick note..."
            className="w-full p-2 border rounded-md resize-none"
            rows={3}
          />
          <button
            onClick={handleSave}
            className="mt-3 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
          >
            Save Mood
          </button>
        </div>
      )}

      <div className="w-full max-w-md mt-6">
        <h2 className="text-xl font-semibold mb-2 text-pink-600">Your Mood History</h2>
        <ul className="space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-gray-500 mb-3">
              No moods saved yet. Pick one above to get started 👆
            </p>
          ) : (
            history.map(({ date, mood, note }) => (
              <li
                key={date + mood}
                className={`p-4 rounded-xl shadow-md border text-left hover:shadow-lg transition-all duration-200 ${
                  moodColors[mood] || 'bg-white'
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{date}</span>
                  <span className="text-xl">{mood}</span>
                </div>
                {note && <p className="text-gray-600 mt-1">{note}</p>}
              </li>
            ))
          )}
        </ul>
      </div>

      {friendsMoods.length > 0 && (
        <div className="w-full max-w-md mt-10">
          <h2 className="text-xl font-semibold mb-3 text-pink-600">Your Friends' Moods</h2>
          <ul className="space-y-3">
            {friendsMoods.map((entry, index) => (
              <li
                key={index}
                className={`p-4 rounded-xl shadow-md border text-left ${
                  moodColors[entry.mood] || 'bg-white'
                }`}
              >
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">User: {entry.user_id}</span>
                  <span className="text-xl">{entry.mood}</span>
                </div>
                {entry.note && <p className="text-gray-600 text-sm mt-1">{entry.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
