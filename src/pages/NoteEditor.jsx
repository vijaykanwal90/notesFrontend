import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { BASE_URL } from '../constants/constant';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, UserCheck2 } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';


const NoteEditor = () => {
  const { noteId } = useParams();
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState({ title: '', content: '' });
  const [userCount, setUserCount] = useState(1);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);

  const lastSavedNote = useRef({ title: '', content: '' });
  const previousUserCount = useRef(1);
  const socketRef = useRef(null);
const navigate = useNavigate(); // ← for logout redirect
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/notes/${noteId}`);
        setNote({ title: res.data.title, content: res.data.content });
        lastSavedNote.current = { title: res.data.title, content: res.data.content };
      } catch (err) {
        console.error('Error fetching note:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [noteId]);

  
  useEffect(() => {
    socketRef.current = io('https://notes-backend-3yyp.onrender.com', {
      transports: ['websocket'],
      forceNew: true,
    });

    const token = localStorage.getItem('token');
    if(token){
        setIsLoggedIn(true)
    }
    socketRef.current.emit('joinNote', { noteId, token });

    socketRef.current.on('userCount', (count) => {
      if (count > previousUserCount.current) {
        toast.success(`A user joined. Active users: ${count}`);
      } else if (count < previousUserCount.current) {
        toast.error(`A user left. Active users: ${count}`);
      }
      previousUserCount.current = count;
      setUserCount(count);
    });

    socketRef.current.on('userList', (users) => {
      setVerifiedUsers(users);
    });

    socketRef.current.on('note:receive', ({ updatedNote }) => {
      setNote((prev) => {
        if (
          prev.title !== updatedNote.title ||
          prev.content !== updatedNote.content
        ) {
          lastSavedNote.current = updatedNote;
          return updatedNote;
        }
        return prev;
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [noteId]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...note, [name]: value };
    setNote(updated);

    socketRef.current.emit('note:update', { noteId, updatedNote: updated });
  };


  useEffect(() => {
    const interval = setInterval(() => {
      const hasChanged =
        note.title !== lastSavedNote.current.title ||
        note.content !== lastSavedNote.current.content;

      if (hasChanged) {
        axios
          .patch(`${BASE_URL}/notes/${noteId}`, note, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })
          .then(() => {
            lastSavedNote.current = { ...note };
            const time = new Date().toLocaleTimeString();
            toast.success(`Auto-saved at ${time}`);
          })
          .catch((err) => {
            toast.error('Auto-save failed');
            console.error('Auto-save error:', err);
          });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [note, noteId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-xl text-gray-600 animate-pulse">Loading note...</span>
      </div>
    );
  }

  return (
  <div className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-8">
    {/*  Top-Right: Active Users + Logout */}
    <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
     
      <button
        onClick={() => setShowUserList(!showUserList)}
        className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full shadow-md text-sm font-medium flex items-center gap-2 hover:bg-blue-200 transition cursor-pointer"
      >
        Active Users: {userCount}
        {showUserList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Logout */}
      {isLoggedIn && (
        <button
          onClick={() => {
            localStorage.removeItem('token');
            toast.success('Logged out');
            setIsLoggedIn(false);
            navigate('/');
          }}
          className="bg-red-500 text-white px-4 py-1 rounded-full text-sm shadow-md hover:bg-red-600 transition cursor-pointer"
        >
          Logout
        </button>
      )}
    </div>

    {/* Dropdown: Verified Users */}
    {showUserList && (
      <div className="absolute top-14 right-4 w-64 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg text-sm p-3 z-10">
        <h4 className="font-semibold text-gray-700 mb-2">Verified Users</h4>
        {verifiedUsers.length > 0 ? (
          <ul className="space-y-1">
            {verifiedUsers.map((user) => (
              <li
                key={user.socketId}
                className="flex items-center gap-2 text-gray-800"
              >
                <UserCheck2 size={16} className="text-green-500" />
                <span className="truncate">{user.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No verified users</p>
        )}
      </div>
    )}

    {/* 📝 Editor Section */}
    <h2 className="text-3xl font-extrabold mb-6 text-gray-800 mt-12 sm:mt-6">Edit Your Note</h2>

    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-200">
      <input
        type="text"
        name="title"
        value={note.title}
        onChange={handleChange}
        placeholder="Enter a title..."
        className="w-full text-2xl font-semibold text-gray-900 border-none border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 transition-all duration-200 placeholder-gray-400 cursor-text"
      />

     <TextareaAutosize
  name="content"
  value={note.content}
  onChange={handleChange}
  placeholder="Write your note..."
  minRows={10}
  maxRows={20}
  className="w-full text-gray-700 resize-none border rounded-lg p-3 focus:outline-blue-500"
/>


    </div>
  </div>
);

};

export default NoteEditor;
