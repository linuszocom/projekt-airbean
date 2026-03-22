export function requireApiKey(req, res, next) {
  const apikey = req.headers["x-api-key"];

  if (!apikey || apikey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Ogiltig eller saknad API-nyckel" });
  }

  next();
}
