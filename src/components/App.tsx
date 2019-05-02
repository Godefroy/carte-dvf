import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { getData } from '../api'
import { IData } from '../config/interfaces'
import ConfigForm from './ConfigForm'
import CustomMap from './CustomMap'

const Header = styled.div`
  position: absolute;
  z-index: 10;
  top: 2em;
  left: 2em;
  margin: 0;
  color: #fff;
  text-shadow: 0 0 16px #000, 5px 5px 16px #000, 5px -5px 16px #000,
    -5px 5px 16px #000, -5px -5px 16px #000;
  h1 {
    font-size: 1.5em;
  }
  a {
    color: #fff;
    text-decoration: underline;
  }
`

const App: React.FC = () => {
  const [data, setData] = useState<IData[]>([])

  const handleSubmit = useCallback(
    async (year, departement) => setData(await getData(year, departement)),
    []
  )

  return (
    <>
      <Header>
        <h1>Carte « Demande de valeurs foncières »</h1>
        <a href="https://cadastre.data.gouv.fr/dvf">Base de données</a> •{' '}
        <a href="https://github.com/Godefroy/carte-dvf">Sources</a>
      </Header>
      <ConfigForm onSubmit={handleSubmit} />
      <CustomMap data={data} />
    </>
  )
}

export default App
