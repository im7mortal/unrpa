import React, {FC, MouseEvent, useContext} from 'react';

import {useTranslation} from "react-i18next";
import GitHubButton from "react-github-btn";

function GithubButtons() {
    const {t} = useTranslation();

    return (
        <>
            <GitHubButton href="https://github.com/im7mortal/unrpa"
                          data-color-scheme="no-preference: light; light: light; dark: dark;"
                          data-icon="octicon-star" data-size="large" data-show-count="true"
                          aria-label="Star im7mortal/unrpa on GitHub">{t('star')}</GitHubButton>
            <GitHubButton href="https://github.com/im7mortal/unrpa/issues"
                          data-color-scheme="no-preference: light; light: light; dark: dark;"
                          data-icon="octicon-issue-opened" data-size="large" data-show-count="true"
                          aria-label="Issue im7mortal/unrpa on GitHub">{t('issue')}</GitHubButton>
        </>
    )
}
export default GithubButtons;