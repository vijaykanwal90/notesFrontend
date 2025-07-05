import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../constants/constant';

const Notes = () => {
  const [myNotes, setMyNotes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyNotes = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/notes`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setMyNotes(res.data || []);
      } catch (err) {
        console.error('Error fetching your notes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyNotes();
  }, []);

  useEffect(() => {
    const fetchAllNotes = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/notes/getAllNotes`);
        setNotes(res.data || []);
      } catch (err) {
        console.error('Error fetching public notes:', err);
      }
    };
    fetchAllNotes();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return alert('Title and content required');
    setCreating(true);

    try {
      const res = await axios.post(`${BASE_URL}/notes/create`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      navigate(`/note/${res.data._id}`);
    } catch (err) {
      console.error('Error creating note:', err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-600 text-lg">Loading your notes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header and Create Button */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
  <h1 className="text-2xl font-bold text-gray-800">Notes Dashboard</h1>
  <div className="flex gap-3">
    <button
      onClick={() => setShowForm(!showForm)}
      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
    >
      {showForm ? 'Cancel' : '+ New Note'}
    </button>
    <button
      onClick={() => {
        localStorage.removeItem('token');
        navigate('/login'); // Or replace with the actual login route
      }}
      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
    >
      Logout
    </button>
  </div>
</div>


      {/* Create Note Form */}
      {showForm && (
        <form
          onSubmit={handleNoteSubmit}
          className="bg-white shadow p-6 rounded-lg mb-10 space-y-4"
        >
          <div>
            <label className="block text-gray-700 font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter title"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter note content"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Note'}
          </button>
        </form>
      )}

     
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-700 mb-4"> Your Notes</h2>
        {myNotes.length === 0 ? (
          <p className="text-gray-500 text-center">You don’t have any notes yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myNotes.map((note) => (
              <Link to={`/note/${note._id}`} key={note._id}>
                <div className="bg-white shadow p-4 rounded-lg hover:shadow-md transition h-full">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {note.title || 'Untitled'}
                  </h3>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                    {note.content || 'No content'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

     
      <hr className="border-gray-300 my-6" />

      {/* Public Notes Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4"> Public Notes</h2>
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center">No public notes available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map((note) => (
              <Link to={`/note/${note._id}`} key={note._id}>
                <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl cursor-pointer transition-all h-full">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 truncate">
                    {note.title || 'Untitled'}
                  </h2>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-4 mb-2">
                    {note.content || 'No content'}
                  </p>
                  <p className="text-xs text-gray-400 mt-auto">
                    Updated: {new Date(note.updatedAt).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
