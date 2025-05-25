import React, { useEffect, useState } from "react";
import Profile from "../assets/profile-user-svgrepo-com.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Nav = () => {
  const [searchItem, setSearchItem] = useState("");
  const [results, setResults] = useState([]);
  const [curruser, setCurrUser] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const searchImmediately = setTimeout(() => {
      if (searchItem.length >= 1) {
        finduser(searchItem);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(searchImmediately);
  }, [searchItem]);

  useEffect(() => {
    finduserself();
  }, []);

  const finduser = async (txt) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/search`,
        {
          params: { que: txt },
          withCredentials: true,
        }
      );
      setResults(response.data);
    } catch (err) {
      console.log(err);
    }
  };
  const finduserself = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/getuserself`,
        {
          withCredentials: true,
        }
      );
      setCurrUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const getuser = async (userid) => {
    navigate(`/profile/${userid}`);
  };
  return (
    <div className="container cont-nav">
      <ul className="nav">
        <li className="logo">Logo</li>
        <input
          type="text"
          className="inp-search"
          placeholder="Search for People"
          onChange={(e) => setSearchItem(e.target.value)}
          value={searchItem}
        />
        <li>
          <img
            src={curruser ? curruser.user.profile : Profile}
            alt="profile"
            className="profile-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = Profile;
            }}
          />
        </li>
      </ul>
      {results.length > 0 && (
        <div className="search-results">
          {results.map((user, index) => (
            <div
              key={index}
              className="search-results-item"
              onClick={() => getuser(user._id)}
            >
              <img
                src={user.profile}
                alt="img"
                className="search-profile-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = Profile;
                }}
              />
              <div className="user-full-names">
                <span className="user-nm-search">{user.username}</span>
                <span className="full-nm-search">{user.fullname}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Nav;
