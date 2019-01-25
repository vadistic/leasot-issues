"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eol_1 = require("eol");
const utils_1 = require("leasot/dist/lib/utils");
const DEFAULT_TAGS = ["todo" /* todo */, "fixme" /* fixme */];
exports.getIssueRegex = (customTags = []) => {
    const tags = DEFAULT_TAGS.concat(customTags);
    return (
    // Optional space.
    '\\s*' +
        // Optional `@`.
        '@?' +
        // One of the keywords such as `TODO` and `FIXME`. OPTIONAL!
        '(' +
        tags.join('|') +
        ')?' +
        // tag cannot be followed by an alpha-numeric character (strict tag match)
        '(?!\\w)' +
        // Optional space.
        '\\s*' +
        // Optional leading reference in parens.
        '(?:\\(([^)]*)\\))?' +
        // Optional space.
        '\\s*' +
        // Optional colon `:`.
        ':?' +
        // Optional space.
        '\\s*' +
        // Comment text.
        '(.*?)' +
        // Optional trailing reference after a space and a slash, followed by an optional space.
        '(?:\\s+/([^\\s]+)\\s*)?');
};
const rBlockComment = /\/\*(?:[\s\S]*?)\*\//gim;
// Bases on get-line-from-pos to support Windows as well
// See https://github.com/pgilad/get-line-from-pos/blob/master/index.js
const getLineFromPos = (str, pos) => {
    if (pos === 0) {
        return 1;
    }
    // adjust for negative pos
    if (pos < 0) {
        pos = str.length + pos;
    }
    const lines = eol_1.split(str.substr(0, pos));
    return lines.length;
};
const handleIssues = (matchArr) => {
    // inside function because:
    // https://stackoverflow.com/questions/15559897/unexpected-javascript-regexp-behavior
    const rGithubIssue = /(?:https?:\/\/)?(?:www.)?github.com\/([A-z0-9@_-]+)\/([A-z0-9@_-]+)\/issues\/([0-9]+)/i;
    const githubMatch = matchArr[3].match(rGithubIssue);
    if (githubMatch !== null) {
        matchArr[1] = 'issue';
        const [all, owner, repo, issueNumber] = githubMatch;
        matchArr[3] = `https://github.com/${owner}/${repo}/issues/${issueNumber}`;
    }
    return matchArr;
};
const parserFactory = ({ customTags }) => {
    const regex = exports.getIssueRegex(customTags);
    const rLineComment = new RegExp('^\\s*\\/\\/' + regex + '$', 'mig');
    const rInnerBlock = new RegExp('^\\s*(?:\\/\\*)?\\**!?' + regex + '(?:\\**\\/)?$', 'mig');
    const parse = (contents, file) => {
        const comments = [];
        eol_1.split(contents).forEach((line, index) => {
            // tslint:disable-next-line:no-shadowed-variable
            let match = rLineComment.exec(line);
            while (match) {
                const comment = utils_1.prepareComment(handleIssues(match), index + 1, file);
                if (!comment) {
                    break;
                }
                comments.push(comment);
                match = rLineComment.exec(line);
            }
        });
        // look for block comments
        let match = rBlockComment.exec(contents);
        while (match) {
            if (!match || !match.length) {
                break;
            }
            // use first match as basis to look into todos/fixmes
            const baseMatch = match[0];
            // jshint loopfunc:true
            eol_1.split(baseMatch).forEach((line, index) => {
                let subMatch = rInnerBlock.exec(line);
                while (subMatch) {
                    const adjustedLine = getLineFromPos(contents, match.index) + index;
                    const comment = utils_1.prepareComment(handleIssues(subMatch), adjustedLine, file);
                    if (!comment) {
                        break;
                    }
                    comments.push(comment);
                    subMatch = rInnerBlock.exec(line);
                }
            });
            match = rBlockComment.exec(contents);
        }
        return comments;
    };
    return parse;
};
exports.default = parserFactory;
