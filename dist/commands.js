import { Collection } from 'discord.js';
import nowPlaying from './commands/now-playing.js';
import invite from './commands/invite.js';
import jump from './commands/jump.js';
import pause from './commands/pause.js';
import ping from './commands/ping.js';
import play from './commands/play.js';
import queue from './commands/queue.js';
import remove from './commands/remove.js';
import resume from './commands/resume.js';
import seek from './commands/seek.js';
import skip from './commands/skip.js';
import stop from './commands/stop.js';
import uptime from './commands/uptime.js';
import volume from './commands/volume.js';
export default new Collection([
    invite,
    jump,
    nowPlaying,
    pause,
    ping,
    play,
    queue,
    remove,
    resume,
    seek,
    skip,
    stop,
    uptime,
    volume
].map(command => [command.data.name, command]));
//# sourceMappingURL=commands.js.map