import axios from 'axios'
import { writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { departements } from '../config/departements'
import { years } from '../config/years'
import { makeDir, promiseSerial, flatten, download, ungzipFile } from '../utils'

const dataDir = resolve(join(__dirname, '../../public/data'))

export async function fetchAndSaveCSV(year: number, departement: string) {
  const dirpath = join(dataDir, year.toString())
  makeDir(dirpath)
  const gzPath = join(dirpath, `${departement}.csv.gz`)
  const csvPath = join(dirpath, `${departement}.csv`)

  console.log(
    `Fetching Gzipped CSV file from ${year} for departement n°${departement}...`
  )
  await download(
    `https://cadastre.data.gouv.fr/data/hackathon-dgfip-dvf/contrib/etalab-csv/${year}/departements/${departement}.csv.gz`,
    gzPath
  )

  console.log(`Ungzipping and writing CSV file...`)
  await ungzipFile(gzPath, csvPath)
}

promiseSerial(
  flatten(
    years.map(year =>
      departements.map(departement => () => fetchAndSaveCSV(year, departement))
    )
  )
)
  .then(() => console.log('Done.'))
  .catch((error: Error) => console.error(error))
