import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../constants/constant';

const Home = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/notes/getAllNotes`);
        setNotes(response.data || []);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-blue-50 to-white px-4 sm:px-6 md:px-10 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center sm:text-left">
           Public Notes
        </h1>

        <div className="flex justify-center sm:justify-end gap-4">
          <Link to="/login">
            <button className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition cursor-pointer shadow-md hover:shadow-lg">
              Login
            </button>
          </Link>
          <Link to="/signup">
            <button className="px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-full hover:bg-green-700 transition cursor-pointer shadow-md hover:shadow-lg">
              Signup
            </button>
          </Link>
        </div>
      </div>

      {/* Notes Grid */}
      {notes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notes.map((note) => (
            <Link to={`/note/${note._id}`} key={note._id}>
              <div className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 h-full cursor-pointer border hover:border-blue-300">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 truncate">
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
      ) : (
        <p className="text-center text-gray-500 text-md mt-8">No notes available.</p>
      )}
    </div>
  );
};

export default Home;
