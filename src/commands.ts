import {Collection} from 'discord.js'
import nowPlaying from './commands/now-playing.js'
import invite from './commands/invite.js'
import pause from './commands/pause.js'
import ping from './commands/ping.js'
import play from './commands/play.js'
import queue from './commands/queue.js'
import resume from './commands/resume.js'
import stop from './commands/stop.js'
import uptime from './commands/uptime.js'

export default new Collection(
  [invite, nowPlaying, pause, ping, play, queue, resume, stop, uptime].map(
    command => [command.data.name, command]
  )
)
