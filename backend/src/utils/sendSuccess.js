/** { success: true, data: ... } — the one response shape every route uses. */
function sendSuccess(res, data, statusCode = 200) {
  res.status(statusCode).json({ success: true, data });
}

module.exports = sendSuccess;
