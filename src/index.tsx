import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { ConfigProvider } from 'antd'

const client = new ApolloClient({
  uri: 'http://localhost:3003/graphql',
  cache: new InMemoryCache(),
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: 'darkblue',
          },
        }}
      >
        <App />
      </ConfigProvider>
    </ApolloProvider>
  </React.StrictMode>,
)
