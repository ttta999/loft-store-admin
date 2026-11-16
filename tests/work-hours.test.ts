import test from 'node:test'
import assert from 'node:assert/strict'
import {workingHours,localWorkClock,validClock} from '../src/lib/workHours.ts'
test('recurring shop hours project through seasonal device rules without modifying the schedule',()=>{
 const winter=new Date('2026-01-15T12:00:00Z'),summer=new Date('2026-07-15T12:00:00Z')
 assert.equal(workingHours('10:00','20:00','Asia/Tashkent',winter).start,'10:00')
 assert.equal(workingHours('10:00','20:00','Europe/Riga',winter).start,'07:00')
 assert.equal(workingHours('10:00','20:00','Europe/Riga',summer).start,'08:00')
 assert.equal(workingHours('10:00','20:00','UTC',winter).end,'15:00')
 const overnight=workingHours('23:00','02:00','Europe/Riga',summer)
 assert.equal(overnight.start,'21:00');assert.equal(overnight.end,'00:00');assert.equal(overnight.dayDifference,1)
 const west=workingHours('02:00','06:00','America/New_York',winter)
 assert.equal(west.start,'16:00');assert.equal(localWorkClock(west.start,west.begin,'America/New_York'),'02:00')
 const local=workingHours('10:00','20:00','Europe/Riga',summer)
 assert.equal(localWorkClock('09:00',local.begin,'Europe/Riga'),'11:00')
 assert.equal(localWorkClock(local.end,local.finish,'Europe/Riga'),'20:00')
 assert.ok(!validClock('10:00 AM'));assert.ok(!validClock('24:00'));assert.ok(validClock('00:00'))
 assert.throws(()=>localWorkClock('03:30',new Date('2026-03-29T12:00:00Z'),'Europe/Riga'))
})
