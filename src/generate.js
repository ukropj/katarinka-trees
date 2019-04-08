import {generateFatherTree} from './fatherTree'
import {generateWorkshopFatherTree} from './workshopFatherTree'

const getProcessArgs = () =>
  process.argv.slice(2).reduce((args, arg) => {
    const [key, value] = arg.split('=')
    args[key.replace(/^--?/, '')] = value != null ? value : true
    return args
  }, {})

const args = getProcessArgs()

if (args.f) {
  generateFatherTree()
}
if (args.wf) {
  generateWorkshopFatherTree()
}
