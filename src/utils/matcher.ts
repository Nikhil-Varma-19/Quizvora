import { match } from "path-to-regexp";

export const isMatch = (patternList: string[], path: string) => {
  return patternList.some((pattern) => {
    const matcher = match(pattern, { decode: decodeURIComponent });
    return matcher(path);
  });
};

export const isRouteMatch = (patterns: string[], path: string) => {
  return patterns.some((pattern) => {
    return match(pattern, { decode: decodeURIComponent })(path);
  });
};