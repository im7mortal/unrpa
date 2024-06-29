import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import GitHubButton from 'react-github-btn'
import { Provider } from 'react-redux';
import store from './redux/store';
import UnrpaApp1 from "./UnrpaApp1";

function App() {
    return (
        <>
            <Provider store={store}>
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
                <UnrpaApp1 />
            </Provider>
        </>
    );
}

export default App;
