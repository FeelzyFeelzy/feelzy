import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

interface MoodEntry {
  date: string
  mood: string
  note: string
}

interface FriendMood {
  user_id: string
  mood: string
  note: string
}

export default function Home() {
  const [mood, setMood] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [history, setHistory] = useState<MoodEntry[]>([])
  const [theme, setTheme] = useState<string>('pink')
  const [user, setUser] = useState<any>(null)
  const [friendsMoods, setFriendsMoods] = useState<FriendMood[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/auth')
      } else {
        setUser(data.session.user)
      }
    }
    checkUser()
  }, [router])

  useEffect(() => {
    if (!user) return
    fetchHistory()
    fetchFriendsMoods(user.id)
  }, [user])

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

    const latestMoods: FriendMood[] = []
    const seen = new Set()

    moods?.forEach((m: FriendMood) => {
      if (!seen.has(m.user_id)) {
        latestMoods.push(m)
        seen.add(m.user_id)
      }
    })

    setFriendsMoods(latestMoods)
  }

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
    <main className={`min-h-screen p-4 relative overflow-hidden ${theme === 'pink' ? 'bg-pink-50' : theme === 'blue' ? 'bg-blue-50' : 'bg-green-50'}`}>
      <div className="absolute top-4 right-4">
        {user && (
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/auth')
            }}
            className="text-sm text-pink-500 underline hover:text-pink-700"
          >
            Logout
          </button>
        )}
      </div>

      <div className="flex flex-col items-center mt-6">
        <h1 className="text-4xl mb-2">🧠 Feelzy</h1>
        {user && <p className="text-gray-600">Hi, {user.email}</p>}
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <button onClick={() => handleThemeChange('pink')} className={`px-3 py-1 rounded-full text-sm font-medium border ${theme === 'pink' ? 'bg-pink-200 border-pink-400' : 'bg-white'}`}>Blush 🌸</button>
        <button onClick={() => handleThemeChange('blue')} className={`px-3 py-1 rounded-full text-sm font-medium border ${theme === 'blue' ? 'bg-blue-200 border-blue-400' : 'bg-white'}`}>Calm 🌊</button>
        <button onClick={() => handleThemeChange('green')} className={`px-3 py-1 rounded-full text-sm font-medium border ${theme === 'green' ? 'bg-green-200 border-green-400' : 'bg-white'}`}>Fresh 🍃</button>
      </div>

      <div className="text-center mt-6">
        <p className="text-gray-700">How are you feeling today?</p>
        <div className="grid grid-cols-4 gap-3 mt-3">
          {moods.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`text-3xl p-2 rounded-full bg-white shadow-sm hover:scale-110 transition ${mood === m ? 'scale-125 ring-2 ring-pink-400' : ''}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mood && (
        <div className="mb-4 w-full max-w-md mx-auto mt-6">
          <p className="mb-2 text-gray-700 text-center">You picked: <span className="text-xl">{mood}</span></p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a quick note..."
            className="w-full p-2 border rounded-md resize-none"
            rows={3}
          />
          <button
            onClick={handleSave}
            className="mt-3 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition w-full"
          >
            Save Mood
          </button>
        </div>
      )}

      <div className="w-full max-w-md mx-auto mt-10">
        <h2 className="text-xl font-semibold mb-2 text-pink-600">Your Mood History</h2>
        <ul className="space-y-3">
          {history.map(({ date, mood, note }) => (
            <li key={date} className={`p-4 rounded-xl shadow border ${moodColors[mood] || 'bg-white'}`}>
              <div className="flex justify-between">
                <span className="font-semibold">{date}</span>
                <span className="text-xl">{mood}</span>
              </div>
              {note && <p className="text-gray-600 mt-1">{note}</p>}
            </li>
          ))}
        </ul>
      </div>

      {friendsMoods.length > 0 && (
        <div className="w-full max-w-md mx-auto mt-10">
          <h2 className="text-xl font-semibold mb-3 text-pink-600">Your Friends&apos; Moods</h2>
          <ul className="space-y-3">
            {friendsMoods.map((entry, index) => (
              <li
                key={index}
                className={`p-4 rounded-xl shadow-md border text-left ${moodColors[entry.mood] || 'bg-white'}`}
              >
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">User: {entry.user_id}</span>
                  <span className="text-xl">{entry.mood}</span>
                </div>
                {entry.note && (
                  <p className="text-gray-600 text-sm mt-1">{entry.note}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}