import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { getData } from '../api'
import { IData } from '../config/interfaces'
import ConfigForm from './ConfigForm'
import CustomMap from './CustomMap'

const Title = styled.h1`
  position: absolute;
  z-index: 10;
  top: 2em;
  left: 2em;
  margin: 0;
  font-size: 1.5em;
  color: #fff;
`

const App: React.FC = () => {
  const [data, setData] = useState<IData[]>([])

  const handleSubmit = useCallback(
    async (year, departement) => setData(await getData(year, departement)),
    []
  )

  return (
    <>
      <Title>Carte « Demande de valeurs foncières »</Title>
      <ConfigForm onSubmit={handleSubmit} />
      <CustomMap data={data} />
    </>
  )
}

export default App
