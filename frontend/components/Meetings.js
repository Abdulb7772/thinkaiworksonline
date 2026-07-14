'use client';

const meetings = [
  {title:'Discovery Call — David Park',date:'Today, 10:00 AM',type:'Video',co:'es',attendees:'Sarah K.'},
  {title:'Project Review — Emma R.',date:'Today, 2:00 PM',type:'Internal',co:'es',attendees:'Omar H., Muhammad Ali'},
  {title:'AI Demo — Tariq Sultan',date:'Today, 4:30 PM',type:'Video',co:'tai',attendees:'Zara T.'},
  {title:'Monthly Strategy — All Team',date:'May 22, 10:00 AM',type:'Internal',co:'both',attendees:'Full Team'},
];

const eventDays = [2,5,8,12,18,22,25,28];
const days = Array.from({length:31},(_,i)=>i+1);
const startDay = 0;
const weekdayHeaders = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const coColor = {es:'var(--es)',tai:'var(--tai)',both:'var(--gold)'};
const coLabel = {es:'tes',tai:'ttai',both:'tb'};

export default function Meetings({ company, onToast }) {
  return (
    <div className="page active" style={{display:'flex'}}>
      <div className="ph">
        <div>
          <div className="pt">Meeting Hub</div>
          <div className="ps">Create · Schedule · Auto-sync with CRM</div>
        </div>
        <button className="btn btn-es" onClick={() => onToast('+ Create Meeting opened')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          + Create Meeting
        </button>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-title">
            May 2025
            <div style={{display:'flex',gap:4}}>
              <button className="btn btn-ghost btn-sm" style={{padding:'3px 8px'}} onClick={() => onToast('Previous month')}>&#8249;</button>
              <button className="btn btn-ghost btn-sm" style={{padding:'3px 8px'}} onClick={() => onToast('Next month')}>&#8250;</button>
            </div>
          </div>
          <div className="cal-grid">
            {weekdayHeaders.map(d => <div key={d} style={{textAlign:'center',fontSize:10,color:'var(--text3)',fontWeight:700,padding:'4px 0',textTransform:'uppercase',letterSpacing:'0.5px'}}>{d}</div>)}
            {Array.from({length:startDay},(_,i)=>(
              <div key={`e${i}`} className="cal-day other"></div>
            ))}
            {days.map(d => (
              <div key={d} className={`cal-day ${eventDays.includes(d) ? 'has-event' : ''} ${d===18?'today':''}`} onClick={() => onToast(`Day ${d} — ${eventDays.includes(d) ? 'Meeting scheduled' : 'No meetings'}`)}>{d}</div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            Upcoming Meetings
            <span className="tag tb">4 today</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {meetings.map((m,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'11px 14px',background:'var(--bg3)',borderRadius:'var(--r)',border:'1px solid var(--border)'}}>
                <div style={{fontSize:20}}>{m.type === 'Video' ? '📹' : '👥'}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13}}>{m.title}</div>
                  <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{m.date} · {m.attendees}</div>
                </div>
                <span className={`tag ${coLabel[m.co]}`} style={{background:coColor[m.co],border:'none'}}>{m.co === 'es' ? 'Ecom' : m.co === 'tai' ? 'TAI' : 'Both'}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => onToast(`Joined ${m.title}`)}>Join</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Quick Schedule</div>
        <div className="intake-form">
          <div className="form-row">
            <div className="form-field">
              <label>Meeting Title</label>
              <input type="text" placeholder="e.g. Strategy Review" />
            </div>
            <div className="form-field">
              <label>Client from CRM</label>
              <select>
                <option value="">Select client...</option>
                <option>David Park</option>
                <option>Emma Richardson</option>
                <option>Ali Hassan</option>
                <option>New Client</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Date & Time</label>
              <input type="datetime-local" defaultValue="2025-05-18T10:00" />
            </div>
            <div className="form-field">
              <label>Attendees</label>
              <select>
                <option value="">Select attendees...</option>
                <option>Sarah K.</option>
                <option>Omar H.</option>
                <option>Zara T.</option>
                <option>Muhammad Ali (CEO)</option>
              </select>
            </div>
          </div>
          <button className="btn btn-es" style={{alignSelf:'flex-start'}} onClick={() => onToast('Meeting saved & team notified')}>Save & Notify Team</button>
        </div>
      </div>
    </div>
  );
}
