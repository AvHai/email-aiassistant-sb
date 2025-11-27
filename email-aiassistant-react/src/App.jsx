import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  IconButton,
  Stack,
  Divider,
  Alert,
  CssBaseline,
  AppBar,
  Toolbar,
  Chip,
  Tooltip,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  AddCircleOutline,
  DeleteOutline,
  DarkMode,
  LightMode,
  ContentCopy,
  CheckCircle,
} from '@mui/icons-material';
import axios from 'axios';

// Note: In a real environment, you would use environment variables for this API URL.
const API_URL = 'http://localhost:8080/api/email/generate';

function App() {
  const [subject, setSubject] = useState('');
  const [messages, setMessages] = useState([
    { sender: '', recipient: '', body: '' },
  ]);
  const [tone, setTone] = useState('formal');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('dark');
  const [copied, setCopied] = useState(false); // New state for copy confirmation

  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: 'Inter, sans-serif',
          h5: {
            fontWeight: 700,
          },
        },
        palette: {
          mode,
          // --- UPDATED COLOR SCHEME: Orange & Violet ---
          primary: {
            main: '#F97316', // Vibrant Orange
          },
          secondary: {
            main: '#6D28D9', // Deep Violet
          },
          background: {
            // Dark purple-black
            default: mode === 'dark' ? '#0F0A1F' : '#FFFBEB', // Light cream/yellow (replaces light grey)
            // Dark purple-indigo for paper
            paper: mode === 'dark' ? '#1A112E' : '#FFFFFF', 
          },
          // Explicitly define divider color to avoid grey, using transparent primary/secondary tones
          divider: mode === 'dark' ? 'rgba(109, 40, 217, 0.4)' : 'rgba(249, 115, 22, 0.3)',
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                boxShadow:
                  mode === 'dark'
                    ? '0 8px 20px rgba(0, 0, 0, 0.6)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.1)',
              },
            },
          },
          MuiButton: {
            defaultProps: {
              disableElevation: true,
            },
            styleOverrides: {
              root: {
                textTransform: 'none', 
                fontWeight: 600,
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                // Ensuring text fields are not grey in dark mode
                backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : 'transparent', 
              }
            }
          }
        },
      }),
    [mode]
  );

  const handleMessageChange = (index, field, value) => {
    setMessages((prev) =>
      prev.map((msg, i) => (i === index ? { ...msg, [field]: value } : msg))
    );
  };

  const handleAddMessage = () => {
    setMessages((prev) => [...prev, { sender: '', recipient: '', body: '' }]);
  };

  const handleRemoveMessage = (index) => {
    setMessages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopy = () => {
    if (generatedReply) {
      // Using navigator.clipboard for standard modern environments
      navigator.clipboard.writeText(generatedReply)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          // Fallback UI indication if copy fails
          setError('Failed to copy to clipboard. Please copy manually.');
        });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setGeneratedReply('');
    try {
      const payload = {
        subject,
        tone,
        messages: messages.map((m, index) => ({
          // Added position for backend processing
          positionInThread: index,
          sender: m.sender,
          recipient: m.recipient || null,
          body: m.body,
        })),
      };

      const response = await axios.post(
        API_URL, // Updated to use constant
        payload
      );

      // Handle both string and object responses from the backend
      const data =
        typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data);
      setGeneratedReply(data.trim());
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to generate email reply. Please check the backend service and try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    subject.trim().length > 0 &&
    messages.some((m) => m.body && m.body.trim().length > 0);

  const toggleMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        {/* Top AppBar with blurred background for a modern effect */}
        <AppBar
          position="sticky"
          color="transparent"
          elevation={0}
          sx={{
            borderBottom: (theme) =>
              `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(10px)',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(15, 10, 31, 0.85)' // Using new dark background
                : 'rgba(255, 251, 235, 0.85)', // Using new light background
          }}
        >
          <Container maxWidth="lg">
            <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0, sm: 0, md: 0 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>
                  ReplyCraft
                </Typography>
                <Chip
                  label="AI Email Assistant"
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
              <IconButton onClick={toggleMode} color="inherit">
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Toolbar>
          </Container>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Main Title/Description */}
          <Box
            sx={{
              mb: 5,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
              Draft Smarter Replies in Seconds
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
              Paste your email thread, select the desired tone, and let AI generate a thoughtful, context-aware reply for you.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 4,
            }}
          >
            {/* LEFT: Input & Configuration Panel */}
            <Paper elevation={4} sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                1. Context & Configuration
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Email Subject"
                  fullWidth
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Follow up on Q4 report"
                  required
                />

                <Divider sx={{ my: 2 }}> Email Thread </Divider>

                <Stack spacing={2} sx={{ maxHeight: 600, overflowY: 'auto', pr: 1 }}>
                  {messages.map((msg, index) => (
                    <Paper
                      key={index}
                      variant="outlined"
                      sx={{
                        p: 2,
                        // Using the divider for the border color
                        borderColor: (theme) => theme.palette.divider, 
                        borderStyle: 'solid',
                        transition: 'border-color 0.3s',
                        '&:hover': {
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Message {index + 1}
                      </Typography>
                      <Stack spacing={1.5}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                          <TextField
                            label="From"
                            fullWidth
                            size="small"
                            value={msg.sender}
                            onChange={(e) => handleMessageChange(index, 'sender', e.target.value)}
                            placeholder="sender@example.com"
                          />
                          <TextField
                            label="To (optional)"
                            fullWidth
                            size="small"
                            value={msg.recipient}
                            onChange={(e) => handleMessageChange(index, 'recipient', e.target.value)}
                            placeholder="recipient@example.com"
                          />
                        </Stack>
                        <TextField
                          label="Body"
                          fullWidth
                          multiline
                          minRows={3}
                          value={msg.body}
                          onChange={(e) => handleMessageChange(index, 'body', e.target.value)}
                          placeholder="Paste the email body here..."
                          required
                        />

                        {messages.length > 1 && (
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Tooltip title="Remove Message">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveMessage(index)}
                              >
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>

                <Button
                  startIcon={<AddCircleOutline />}
                  variant="outlined"
                  color="secondary"
                  onClick={handleAddMessage}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add another message to thread
                </Button>

                <FormControl fullWidth>
                  <InputLabel id="tone-label">Reply Tone</InputLabel>
                  <Select
                    labelId="tone-label"
                    label="Reply Tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <MenuItem value="formal">Formal (Professional, detailed)</MenuItem>
                    <MenuItem value="friendly">Friendly (Casual, positive)</MenuItem>
                    <MenuItem value="concise">Concise (Direct, brief)</MenuItem>
                  </Select>
                </FormControl>

                {error && <Alert severity="error">{error}</Alert>}

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!isFormValid || loading}
                  fullWidth
                  size="large"
                  sx={{ mt: 2, height: 56 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Generate AI Reply'
                  )}
                </Button>
              </Stack>
            </Paper>

            {/* RIGHT: Output Panel */}
            <Paper elevation={4} sx={{ p: 4, display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  2. Generated Reply
                </Typography>
                <Tooltip title={copied ? 'Copied!' : 'Copy to Clipboard'}>
                  <IconButton
                    onClick={handleCopy}
                    disabled={!generatedReply}
                    color={copied ? 'success' : 'primary'}
                    size="large"
                  >
                    {copied ? <CheckCircle /> : <ContentCopy />}
                  </IconButton>
                </Tooltip>
              </Box>

              <Box
                sx={{
                  flexGrow: 1,
                  minHeight: '400px',
                  p: 2,
                  // Using the divider for the border color
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: (theme) => theme.palette.background.paper, 
                  whiteSpace: 'pre-wrap',
                  overflowY: 'auto',
                }}
              >
                {generatedReply ? (
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {generatedReply}
                  </Typography>
                ) : (
                  <Typography
                    variant="body1"
                    color="text.disabled"
                    sx={{ fontStyle: 'italic' }}
                  >
                    {loading
                      ? 'AI is crafting your response...'
                      : 'Your AI-generated reply will appear here after clicking "Generate AI Reply".'}
                  </Typography>
                )}
              </Box>
              
              {/* Optional: Add instructions or next steps here */}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                Review and edit the reply before sending. Click the copy icon to use it.
              </Typography>
            </Paper>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
