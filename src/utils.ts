import fs from 'fs'
import path from 'path'
import https from 'https'
import zlib from 'zlib'

export const promiseSerial = <T>(
  funcs: Array<() => Promise<T>>
): Promise<T[]> =>
  funcs.reduce(
    (promise, func) =>
      promise.then(values => func().then(value => [...values, value])),
    Promise.resolve([] as T[])
  )

export const flatten = <T>(array: Array<ConcatArray<T>>) =>
  ([] as T[]).concat(...array)

export function makeDir(dirpath: string) {
  if (!fs.existsSync(dirpath)) {
    const parsedPath = path.parse(dirpath)
    if (!fs.existsSync(parsedPath.dir)) {
      makeDir(parsedPath.dir)
    }
    fs.mkdirSync(dirpath)
  }
}

export async function download(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    https
      .get(url, response => {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
      })
      .on('error', error => fs.unlink(filepath, () => reject(error.message)))
  })
}

export async function ungzipFile(
  srcpath: string,
  destpath: string
): Promise<void> {
  return new Promise(resolve => {
    // prepare streams
    const src = fs.createReadStream(srcpath)
    const dest = fs.createWriteStream(destpath)

    // extract the archive
    src.pipe(zlib.createGunzip()).pipe(dest)

    // callback on extract completion
    dest.on('close', resolve)
  })
}
