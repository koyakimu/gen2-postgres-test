import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/api'
import { type Schema } from '../amplify/data/resource'
import { Amplify } from 'aws-amplify'
import outputs from '../amplify_outputs.json'
import { withAuthenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

Amplify.configure(outputs)

const client = generateClient<Schema>();

function App() {
  const [notes, setNotes] = useState<Schema["Note"]["type"][]>([])
  useEffect(() => {
    const sub = client.models.Note.observeQuery().subscribe({
      next: (data) => {
        setNotes([...data.items])
      }
    })
    return () => sub.unsubscribe() 
  }, [])

  return (
    <>
      <button onClick={async () => {
        const { data } = await client.queries.listEventWithCoord()
        window.alert(JSON.stringify(data))
      }}>Fetch events</button>
      <h1>Note</h1>
      <ul>
        {notes?.map(note => (
          <li key={note.id} onClick={async () => {
            await client.models.Note.delete({ id: note.id })
          }}>
            <div>{note.content}</div>
          </li>
        ))}
      </ul>
      <button onClick={async () => {
        await client.models.Note.create({
          content: window.prompt("New note?"),
        })
      }}>Create Note</button>
    </>
  )
}

export default withAuthenticator(App)