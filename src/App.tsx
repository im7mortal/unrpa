import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import GitHubButton from 'react-github-btn';
import UnrpaApp1 from "./UnrpaApp1";

function App() {
    return (
        <Router>
            <>
                <div className="row mr-2 mt-2">
                    <div className="col-10 text-left">
                        ITWILLBEREPLACEDWITHVERSION
                    </div>

                    <div className="col-2 text-right">
                        <GitHubButton href="https://github.com/im7mortal/unrpa"
                                      data-color-scheme="no-preference: light; light: light; dark: dark;"
                                      data-icon="octicon-star" data-size="large"
                                      aria-label="Star buttons/github-buttons on GitHub">Star</GitHubButton>
                        <GitHubButton href="https://github.com/im7mortal/unrpa/issues"
                                      data-color-scheme="no-preference: light; light: light; dark: dark;"
                                      data-icon="octicon-issue-opened" data-size="large"
                                      aria-label="Issue buttons/github-buttons on GitHub">Issue</GitHubButton>
                    </div>
                </div>

                <h1 className="display-1 text-center">UNRPA - Extract Ren'Py Archives</h1>

                <Routes>
                    <Route path="/unrpa" element={<UnrpaApp1 />} />
                    <Route path="*" element={<Navigate to="/unrpa" />} />
                </Routes>
            </>
        </Router>
    );
}

export default App;