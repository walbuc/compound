import React from 'react'
import './App.css'
import ErrorBoundary from 'react-error-boundary'
import ThemeProvider from './shared/theme-provider'
import {IsolatedContainer, LoadingMessagePage} from './shared/pattern'
import loadable from 'react-loadable'

function LoadingFallback({error, pastDelay}) {
  if (error) {
    // ErrorBoundary will catch this
    throw error
  }
  return <LoadingMessagePage>Loading Application</LoadingMessagePage>
}

const Form = loadable({
  loader: () => import('./screens/home/Form'),
  loading: LoadingFallback,
})

function ErrorFallback({error}) {
  return (
    <IsolatedContainer>
      <p>There was an error</p>
      <pre style={{maxWidth: 700}}>{JSON.stringify(error, null, 2)}</pre>
    </IsolatedContainer>
  )
}
function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Form />
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
