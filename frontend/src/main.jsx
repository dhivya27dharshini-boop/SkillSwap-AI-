import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  useNavigate,
  useLocation,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import axios from 'axios';

import {
  LayoutDashboard,
  Users,
  Brain,
  MessageCircle,
  Repeat2,
  UserCircle,
  LogOut,
  Sun,
  Moon,
  Bell,
  Search,
  Plus,
  Trash2,
  Check,
  X,
  Sparkles,
  Menu,
  ShieldCheck
} from 'lucide-react';

import './styles.css';


const API =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

const api = axios.create({
  baseURL: API
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


const initials = name =>
  (name || 'U')
    .split(' ')
    .map(x => x[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();


function App() {

  const [dark, setDark] = useState(
    localStorage.getItem('dark') === '1'
  );

  useEffect(() => {
    document.body.className = dark ? 'dark' : '';
    localStorage.setItem('dark', dark ? '1' : '0');
  }, [dark]);

  return (
    <Routes>

      <Route
        path="/login"
        element={<Auth />}
      />

      <Route
        path="/register"
        element={<Auth register />}
      />

      <Route
        path="*"
        element={
          <Protected>
            <Shell
              dark={dark}
              setDark={setDark}
            />
          </Protected>
        }
      />

    </Routes>
  );
}


function Protected({ children }) {

  return localStorage.getItem('token')
    ? children
    : <NavigateTo path="/login" />;
}


function NavigateTo({ path }) {

  const navigate = useNavigate();

  useEffect(() => {
    navigate(path);
  }, [path]);

  return null;
}


function Shell({ dark, setDark }) {

  const location = useLocation();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [mobile, setMobile] = useState(false);


  useEffect(() => {

    api
      .get('/me')
      .then(response => setMe(response.data))
      .catch(() => {
        localStorage.clear();
        navigate('/login');
      });

  }, []);


  const links = [

    ['/', 'Dashboard', LayoutDashboard],

    ['/discover', 'Discover Skills', Users],

    ['/recommendations', 'AI Matches', Brain],

    ['/swaps', 'Swap Requests', Repeat2],

    ['/messages', 'Messages', MessageCircle],

    ['/profile', 'My Profile', UserCircle]

  ];


  return (

    <div className="app">

      <aside
        className={
          mobile
            ? 'sidebar open'
            : 'sidebar'
        }
      >

        <div className="brand">

          <div className="brandmark">
            <Sparkles size={19} />
          </div>

          <span>
            SkillSwap <b>AI</b>
          </span>

        </div>


        <nav>

          {links.map(([path, title, Icon]) => (

            <Link
              onClick={() => setMobile(false)}
              className={
                location.pathname === path
                  ? 'active'
                  : ''
              }
              to={path}
              key={path}
            >

              <Icon size={18} />

              {title}

            </Link>

          ))}

        </nav>


        {me?.role === 'admin' && (

          <Link
            className="adminLink"
            to="/admin"
          >

            <ShieldCheck size={18} />

            Admin Panel

          </Link>

        )}


        <div className="sidebarBottom">

          <button onClick={() => setDark(!dark)}>

            <span>

              {dark
                ? <Sun size={18} />
                : <Moon size={18} />
              }

              {dark
                ? 'Light mode'
                : 'Dark mode'
              }

            </span>

          </button>


          <button
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
          >

            <LogOut size={18} />

            Logout

          </button>

        </div>

      </aside>


      <main>

        <header>

          <button
            className="icon mobileOnly"
            onClick={() => setMobile(!mobile)}
          >

            <Menu />

          </button>


          <div className="topTitle">

            {location.pathname === '/'
              ? 'Good to see you 👋'
              : 'SkillSwap AI'
            }

          </div>


          <div className="topActions">

            <Link
              to="/notifications"
              className="icon"
            >

              <Bell size={19} />

            </Link>


            <Link
              to="/profile"
              className="avatar"
            >

              {initials(me?.name)}

            </Link>

          </div>

        </header>


        <div className="page">

          <Routes>

            <Route
              path="/"
              element={<Dashboard me={me} />}
            />

            <Route
              path="/discover"
              element={<Discover me={me} />}
            />

            <Route
              path="/recommendations"
              element={<Recommendations />}
            />

            <Route
              path="/swaps"
              element={<Swaps />}
            />

            <Route
              path="/messages"
              element={<Messages />}
            />

            <Route
              path="/profile"
              element={
                <Profile
                  me={me}
                  setMe={setMe}
                />
              }
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route
              path="/admin"
              element={<Admin />}
            />

          </Routes>

        </div>

      </main>

    </div>

  );
}


function Auth({ register = false }) {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [err, setErr] = useState('');


  async function submit(e) {

    e.preventDefault();

    setErr('');

    try {

      const response = await api.post(
        register
          ? '/auth/register'
          : '/auth/login',
        form
      );

      localStorage.setItem(
        'token',
        response.data.token
      );

      navigate('/');

    } catch (error) {

      setErr(
        error.response?.data?.message ||
        'Something went wrong'
      );

    }

  }


  return (

    <div className="auth">

      <div className="authCard">

        <div className="brand authBrand">

          <div className="brandmark">
            <Sparkles />
          </div>

          <span>
            SkillSwap <b>AI</b>
          </span>

        </div>


        <h1>
          {register
            ? 'Create your account'
            : 'Welcome back'
          }
        </h1>


        <p className="muted">

          {register
            ? 'Exchange skills. Learn together. Grow together.'
            : 'Continue your skill-sharing journey.'
          }

        </p>


        <form onSubmit={submit}>

          {register && (

            <input
              placeholder="Full name"
              value={form.name}
              onChange={e =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
            />

          )}


          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
          />


          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
          />


          {err && (
            <div className="error">
              {err}
            </div>
          )}


          <button className="primary full">

            {register
              ? 'Create Account'
              : 'Sign In'
            }

          </button>

        </form>


        <p className="switch">

          {register
            ? 'Already have an account?'
            : 'New to SkillSwap?'
          }

          {' '}

          <Link
            to={
              register
                ? '/login'
                : '/register'
            }
          >

            {register
              ? 'Sign in'
              : 'Create account'
            }

          </Link>

        </p>

      </div>

    </div>

  );
}


function Stat({ icon: Icon, label, value }) {

  return (

    <div className="stat">

      <div className="statIcon">
        <Icon size={20} />
      </div>

      <div>

        <small>
          {label}
        </small>

        <strong>
          {value}
        </strong>

      </div>

    </div>

  );
}


function Dashboard({ me }) {

  const [d, setD] = useState({});
  const [recs, setRecs] = useState([]);


  useEffect(() => {

    api
      .get('/dashboard')
      .then(response =>
        setD(response.data)
      );


    api
      .get('/recommendations')
      .then(response =>
        setRecs(response.data.slice(0, 3))
      );

  }, []);


  return (

    <>

      <section className="hero">

        <div>

          <span className="eyebrow">
            AI-POWERED SKILL EXCHANGE
          </span>

          <h1>

            Build your network.
            <br />

            <em>
              Share what you know.
            </em>

          </h1>

          <p>

            Find people who can teach you what
            you want to learn — and exchange your
            own expertise.

          </p>


          <Link
            className="primary"
            to="/discover"
          >

            Explore Skills
            <span>→</span>

          </Link>

        </div>


        <div className="heroOrb">

          <Sparkles size={90} />

        </div>

      </section>


      <div className="stats">

        <Stat
          icon={Brain}
          label="My skills"
          value={d.skills || 0}
        />

        <Stat
          icon={Repeat2}
          label="Swap requests"
          value={
            (d.sent || 0) +
            (d.received || 0)
          }
        />

        <Stat
          icon={Bell}
          label="Unread alerts"
          value={d.unread || 0}
        />

        <Stat
          icon={Users}
          label="Connections"
          value={d.received || 0}
        />

      </div>


      <div className="sectionHead">

        <div>

          <h2>
            Recommended for you
          </h2>

          <p>
            AI matches based on your learning goals.
          </p>

        </div>


        <Link to="/recommendations">
          View all →
        </Link>

      </div>


      <div className="cards">

        {recs.map(r => (

          <PersonCard
            key={r.id}
            r={r}
            compact
          />

        ))}

      </div>

    </>

  );
}


/* ============================= */
/* PERSON CARD */
/* ============================= */

function PersonCard({
  r,
  compact = false,
  onRequest
}) {

  return (

    <div className="person">

      <div className="personTop">

        <div className="avatar big">

          {initials(r.user_name)}

        </div>


        <div>

          <h3>
            {r.user_name}
          </h3>

          <span className="muted">

            {r.location || 'Online'}

            {' · '}

            {r.category}

          </span>

        </div>


        {r.score && (

          <span className="match">

            {r.score}% match

          </span>

        )}

      </div>


      <div className="skillTags">

        <span>
          {r.name}
        </span>

        <span>
          {r.level}
        </span>

      </div>


      <p>

        {r.reason ||
          r.description ||
          'Open to a skill exchange.'
        }

      </p>


      {!compact && (

        <button
          className="primary small"
          onClick={onRequest}
        >

          Request swap

        </button>

      )}

    </div>

  );

}


/* ============================= */
/* DISCOVER */
/* ============================= */

function Discover() {

  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);


  async function search() {

    try {

      const response = await api.get(
        '/skills',
        {
          params: { q }
        }
      );

      setRows(response.data);

    } catch (error) {

      console.error(
        'Skill search error:',
        error
      );

    }

  }


  useEffect(() => {

    search();

  }, []);


  return (

    <>

      <div className="sectionHead">

        <div>

          <h1>
            Discover Skills
          </h1>

          <p>
            Find people by skill, category
            or expertise level.
          </p>

        </div>


        <Link
          className="primary"
          to="/profile"
        >

          <Plus size={18} />

          Add skill

        </Link>

      </div>


      <div className="search">

        <Search size={18} />

        <input
          placeholder="Search React, Python, UI/UX, SQL..."
          value={q}
          onChange={e =>
            setQ(e.target.value)
          }
          onKeyDown={e =>
            e.key === 'Enter' && search()
          }
        />


        <button onClick={search}>
          Search
        </button>

      </div>


      <div className="cards">

        {rows.map(r => (

          <PersonCard
            key={r.id}
            r={r}
            onRequest={() =>
              setSelected(r)
            }
          />

        ))}

      </div>


      {selected && (

        <SwapModal
          skill={selected}
          close={() =>
            setSelected(null)
          }
        />

      )}

    </>

  );
}


/* ============================= */
/* SWAP MODAL */
/* ============================= */

function SwapModal({
  skill,
  close
}) {

  const [message, setMessage] =
    useState(
      'Hi! I would like to exchange skills with you.'
    );

  const [mine, setMine] = useState([]);

  const [sending, setSending] =
    useState(false);


  useEffect(() => {

    api
      .get('/my-skills')
      .then(response =>
        setMine(response.data)
      )
      .catch(error =>
        console.error(
          'My skills error:',
          error
        )
      );

  }, []);


  async function send() {

    if (!skill?.user_id) {

      alert(
        'Unable to identify this user.'
      );

      return;

    }


    if (!skill?.id) {

      alert(
        'Unable to identify the requested skill.'
      );

      return;

    }


    if (!mine.length) {

      alert(
        'Please add at least one skill to your profile before sending a swap request.'
      );

      return;

    }


    try {

      setSending(true);


      await api.post(
        '/swaps',
        {
          receiver_id: skill.user_id,

          offered_skill_id:
            mine[0].id,

          requested_skill_id:
            skill.id,

          message
        }
      );


      close();


      alert(
        'Swap request sent successfully!'
      );


    } catch (error) {

      console.error(
        'Swap request error:',
        error
      );


      alert(
        error.response?.data?.message ||
        'Failed to send swap request.'
      );


    } finally {

      setSending(false);

    }

  }


  return (

    <div className="modalBack">

      <div className="modal">

        <button
          className="close"
          onClick={close}
        >

          <X />

        </button>


        <h2>
          Request a skill swap
        </h2>


        <p>

          You are requesting

          {' '}

          <b>
            {skill.name}
          </b>

          {' '}from{' '}

          {skill.user_name}.

        </p>


        <select defaultValue="">

          <option value="">
            Offer: {mine[0]?.name ||
              'Add a skill first'}
          </option>

        </select>


        <textarea
          value={message}
          onChange={e =>
            setMessage(e.target.value)
          }
        />


        <button
          className="primary full"
          onClick={send}
          disabled={
            sending ||
            !mine.length
          }
        >

          {sending
            ? 'Sending...'
            : 'Send request'
          }

        </button>

      </div>

    </div>

  );

}


/* ============================= */
/* AI RECOMMENDATIONS */
/* ============================= */

function Recommendations() {

  const [rows, setRows] = useState([]);

  const [selected, setSelected] =
    useState(null);


  useEffect(() => {

    api
      .get('/recommendations')
      .then(response =>
        setRows(response.data)
      )
      .catch(error =>
        console.error(
          'Recommendations error:',
          error
        )
      );

  }, []);


  return (

    <>

      <section className="aiHeader">

        <div className="aiIcon">

          <Sparkles />

        </div>


        <div>

          <span className="eyebrow">
            AI MATCH ENGINE
          </span>

          <h1>
            Made for your learning goals
          </h1>

          <p>
            Recommendations combine skill names,
            categories and your learning intent.
          </p>

        </div>

      </section>


      <div className="cards">

        {rows.map(r => (

          <PersonCard
            key={r.id}
            r={r}

            /* THIS FIX CONNECTS THE BUTTON */

            onRequest={() =>
              setSelected(r)
            }

          />

        ))}

      </div>


      {selected && (

        <SwapModal
          skill={selected}
          close={() =>
            setSelected(null)
          }
        />

      )}

    </>

  );

}


/* ============================= */
/* SWAP REQUESTS */
/* ============================= */

function Swaps() {

  const [rows, setRows] =
    useState([]);


  const load = () => {

    api
      .get('/swaps')
      .then(response =>
        setRows(response.data)
      )
      .catch(error =>
        console.error(
          'Swap loading error:',
          error
        )
      );

  };


  useEffect(() => {

    load();

  }, []);


  async function act(id, status) {

    try {

      await api.patch(
        '/swaps/' + id,
        { status }
      );

      load();

    } catch (error) {

      console.error(
        'Swap action error:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Unable to update request.'
      );

    }

  }


  return (

    <>

      <div className="sectionHead">

        <div>

          <h1>
            Swap Requests
          </h1>

          <p>
            Manage incoming and outgoing skill exchanges.
          </p>

        </div>

      </div>


      <div className="tableCard">

        {rows.length ? (

          <table>

            <thead>

              <tr>

                <th>
                  People
                </th>

                <th>
                  Message
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {rows.map(x => (

                <tr key={x.id}>

                  <td>

                    <b>
                      {x.sender_name}
                    </b>

                    {' → '}

                    <b>
                      {x.receiver_name}
                    </b>

                  </td>


                  <td>
                    {x.message || '—'}
                  </td>


                  <td>

                    <span
                      className={
                        'status ' +
                        x.status
                      }
                    >

                      {x.status}

                    </span>

                  </td>


                  <td>

                    {x.status === 'pending' && (

                      <div className="actions">

                        <button
                          onClick={() =>
                            act(
                              x.id,
                              'accepted'
                            )
                          }
                        >

                          <Check size={16} />

                        </button>


                        <button
                          onClick={() =>
                            act(
                              x.id,
                              'rejected'
                            )
                          }
                        >

                          <X size={16} />

                        </button>

                      </div>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        ) : (

          <Empty
            title="No swap requests yet"
            text="Discover a skill and send your first request."
          />

        )}

      </div>

    </>

  );

}


/* ============================= */
/* MESSAGES */
/* ============================= */

function Messages() {

  const [people, setPeople] =
    useState([]);

  const [user, setUser] =
    useState(null);

  const [msgs, setMsgs] =
    useState([]);

  const [text, setText] =
    useState('');


  useEffect(() => {

    api
      .get('/skills')
      .then(response => {

        const map = {};

        response.data.forEach(x => {

          map[x.user_id] = {
            id: x.user_id,
            name: x.user_name
          };

        });

        setPeople(
          Object.values(map)
        );

      });

  }, []);


  useEffect(() => {

    if (user) {

      api
        .get('/messages/' + user.id)
        .then(response =>
          setMsgs(response.data)
        );

    }

  }, [user]);


  async function send() {

    if (!text.trim() || !user) {
      return;
    }


    try {

      await api.post(
        '/messages',
        {
          receiver_id: user.id,
          content: text
        }
      );


      setMsgs([
        ...msgs,
        {
          sender_id: 'me',
          content: text
        }
      ]);


      setText('');

    } catch (error) {

      console.error(
        'Message error:',
        error
      );

    }

  }


  return (

    <div className="chat">

      <div className="people">

        <h3>
          Messages
        </h3>


        {people.map(p => (

          <button
            className={
              user?.id === p.id
                ? 'selected'
                : ''
            }
            onClick={() =>
              setUser(p)
            }
            key={p.id}
          >

            <span className="avatar">

              {initials(p.name)}

            </span>

            {p.name}

          </button>

        ))}

      </div>


      <div className="conversation">

        {user ? (

          <>

            <div className="chatHead">

              <span className="avatar">

                {initials(user.name)}

              </span>

              <b>
                {user.name}
              </b>

            </div>


            <div className="bubbles">

              {msgs.map((m, i) => (

                <div
                  className={
                    m.sender_id === user.id
                      ? 'bubble'
                      : 'bubble mine'
                  }
                  key={i}
                >

                  {m.content}

                </div>

              ))}

            </div>


            <div className="composer">

              <input
                value={text}
                onChange={e =>
                  setText(e.target.value)
                }
                onKeyDown={e =>
                  e.key === 'Enter' &&
                  send()
                }
                placeholder="Write a message..."
              />


              <button
                className="primary"
                onClick={send}
              >

                Send

              </button>

            </div>

          </>

        ) : (

          <Empty
            title="Choose a conversation"
            text="Select a person to start chatting."
          />

        )}

      </div>

    </div>

  );

}


/* ============================= */
/* PROFILE */
/* ============================= */

function Profile({
  me,
  setMe
}) {

  const [form, setForm] =
    useState({
      name: '',
      bio: '',
      location: '',
      avatar_url: ''
    });


  const [skills, setSkills] =
    useState([]);


  const [newSkill, setNewSkill] =
    useState({
      name: '',
      category: 'Web Development',
      level: 'Beginner',
      type: 'offer',
      description: ''
    });


  useEffect(() => {

    if (me) {

      setForm(me);

    }

    load();

  }, [me]);


  const load = () => {

    api
      .get('/my-skills')
      .then(response =>
        setSkills(response.data)
      );

  };


  async function save() {

    try {

      await api.put(
        '/me',
        form
      );

      setMe({
        ...me,
        ...form
      });

      alert(
        'Profile updated'
      );

    } catch (error) {

      console.error(
        'Profile update error:',
        error
      );

    }

  }


  async function add() {

    if (!newSkill.name) {
      return;
    }


    try {

      await api.post(
        '/skills',
        newSkill
      );


      setNewSkill({
        ...newSkill,
        name: '',
        description: ''
      });


      load();

    } catch (error) {

      console.error(
        'Add skill error:',
        error
      );

    }

  }


  async function del(id) {

    await api.delete(
      '/skills/' + id
    );

    load();

  }


  return (

    <>

      <div className="profileHero">

        <div className="avatar xl">

          {initials(form.name)}

        </div>


        <div>

          <h1>
            {form.name}
          </h1>

          <p>

            {form.location ||
              'Add your location'}

            {' · Skill Explorer'}

          </p>

        </div>

      </div>


      <div className="twoCol">

        <div className="panel">

          <h2>
            Profile details
          </h2>


          <label>

            Name

            <input
              value={form.name || ''}
              onChange={e =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
            />

          </label>


          <label>

            Location

            <input
              value={
                form.location || ''
              }
              onChange={e =>
                setForm({
                  ...form,
                  location: e.target.value
                })
              }
            />

          </label>


          <label>

            Bio

            <textarea
              value={form.bio || ''}
              onChange={e =>
                setForm({
                  ...form,
                  bio: e.target.value
                })
              }
            />

          </label>


          <button
            className="primary"
            onClick={save}
          >

            Save changes

          </button>

        </div>


        <div className="panel">

          <h2>
            My skills
          </h2>


          <div className="skillForm">

            <input
              placeholder="Skill name"
              value={newSkill.name}
              onChange={e =>
                setNewSkill({
                  ...newSkill,
                  name: e.target.value
                })
              }
            />


            <select
              value={newSkill.level}
              onChange={e =>
                setNewSkill({
                  ...newSkill,
                  level: e.target.value
                })
              }
            >

              <option>
                Beginner
              </option>

              <option>
                Intermediate
              </option>

              <option>
                Advanced
              </option>

              <option>
                Expert
              </option>

            </select>


            <button
              className="primary"
              onClick={add}
            >

              <Plus size={17} />

              Add

            </button>

          </div>


          {skills.map(s => (

            <div
              className="skillRow"
              key={s.id}
            >

              <div>

                <b>
                  {s.name}
                </b>

                <small>

                  {s.category}
                  {' · '}
                  {s.level}
                  {' · '}
                  {s.type}

                </small>

              </div>


              <button
                onClick={() =>
                  del(s.id)
                }
              >

                <Trash2 size={17} />

              </button>

            </div>

          ))}

        </div>

      </div>

    </>

  );

}


/* ============================= */
/* NOTIFICATIONS */
/* ============================= */

function Notifications() {

  const [rows, setRows] =
    useState([]);


  useEffect(() => {

    api
      .get('/notifications')
      .then(response =>
        setRows(response.data)
      );

  }, []);


  return (

    <>

      <h1>
        Notifications
      </h1>

      <p className="muted">
        Your latest activity and swap updates.
      </p>


      <div className="list">

        {rows.map(n => (

          <div
            className="notice"
            key={n.id}
          >

            <div className="noticeIcon">

              <Bell size={17} />

            </div>


            <div>

              <b>
                {n.title}
              </b>

              <p>
                {n.message}
              </p>

              <small>

                {new Date(
                  n.created_at
                ).toLocaleString()}

              </small>

            </div>

          </div>

        ))}


        {!rows.length && (

          <Empty
            title="All clear"
            text="You have no notifications."
          />

        )}

      </div>

    </>

  );

}


/* ============================= */
/* ADMIN */
/* ============================= */

function Admin() {

  const [s, setS] =
    useState({});


  useEffect(() => {

    api
      .get('/admin/stats')
      .then(response =>
        setS(response.data)
      )
      .catch(() => {});

  }, []);


  return (

    <>

      <div className="sectionHead">

        <div>

          <h1>
            Admin Panel
          </h1>

          <p>
            Platform overview and moderation metrics.
          </p>

        </div>

      </div>


      <div className="stats">

        <Stat
          icon={Users}
          label="Users"
          value={s.users || 0}
        />

        <Stat
          icon={Brain}
          label="Skills"
          value={s.skills || 0}
        />

        <Stat
          icon={Repeat2}
          label="Swaps"
          value={s.swaps || 0}
        />

        <Stat
          icon={ShieldCheck}
          label="Open reports"
          value={s.reports || 0}
        />

      </div>


      <div className="panel">

        <h2>
          Administration
        </h2>

        <p className="muted">

          Use this area for user moderation,
          reports, categories and platform
          analytics in your final implementation.

        </p>

      </div>

    </>

  );

}


/* ============================= */
/* EMPTY STATE */
/* ============================= */

function Empty({
  title,
  text
}) {

  return (

    <div className="empty">

      <div className="emptyIcon">

        <Sparkles />

      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>

  );

}


/* ============================= */
/* START APPLICATION */
/* ============================= */

createRoot(
  document.getElementById('root')
).render(

  <BrowserRouter>

    <App />

  </BrowserRouter>

);