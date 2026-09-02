import './Loading.css'

export default function Loading({ fullscreen = false, text = 'Loading...' }) {
  return (
    <div className={`loading ${fullscreen ? 'loading--fullscreen' : ''}`}>
      <div className="loading__spinner" />
      <p className="loading__text">{text}</p>
    </div>
  )
}
