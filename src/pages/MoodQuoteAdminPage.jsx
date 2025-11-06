// src/pages/MoodQuoteAdminPage.jsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  Stack,
  IconButton,
  Divider,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const moods = [
  { id: "anxiety", label: "불안" },
  { id: "lethargy", label: "무기력" },
  { id: "coldness", label: "냉담" },
  { id: "lonely", label: "외로움" },
  { id: "calm", label: "평온" },
  { id: "sadness", label: "슬픔" },
  { id: "protection", label: "보호" },
  { id: "happiness", label: "행복" },
  { id: "hope", label: "희망" },
  { id: "growth", label: "성장" },
  { id: "confident", label: "자신감" },
  { id: "adventurous", label: "모험" },
];

export default function MoodQuoteAdminPage() {
  const theme = useTheme();
  const [selectedMood, setSelectedMood] = useState("");
  const [quotes, setQuotes] = useState([""]);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

  const primary = theme.palette.primary.main;
  const panelBg = useMemo(() => alpha(primary, 0.06), [primary]);

  // 유효성
  const trimmed = quotes.map((q) => q.trim()).filter((q) => q.length > 0);
  const hasDuplicate = new Set(trimmed).size !== trimmed.length;
  const canSave = selectedMood && trimmed.length > 0 && !hasDuplicate && !saving;

  const onAddField = () => setQuotes((prev) => [...prev, ""]);
  const onChangeQuote = (idx, value) =>
    setQuotes((prev) => prev.map((q, i) => (i === idx ? value : q)));
  const onRemoveField = (idx) =>
    setQuotes((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "moodQuotes", selectedMood), {
        mood: moods.find((m) => m.id === selectedMood)?.label ?? selectedMood,
        quotes: trimmed,
        updatedAt: new Date(),
      });
      setSnack({ open: true, type: "success", msg: "저장되었습니다." });
      setQuotes([""]);
    } catch (e) {
      setSnack({ open: true, type: "error", msg: `저장 실패: ${e.message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 720, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        감정 문구 관리
      </Typography>

      {/* 상단 선택 패널 */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(180deg, ${panelBg}, transparent)`,
        }}
      >
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="감정 선택"
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              fullWidth
              helperText="저장할 감정을 선택하세요."
            >
              {moods.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              color="primary"
              startIcon={<PlaylistAddIcon />}
              onClick={onAddField}
            >
              문구 필드 추가
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 문구 입력 리스트 */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={1.5}>
            {quotes.map((quote, index) => {
              const error = quote.trim().length === 0;
              return (
                <Stack
                  key={index}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <TextField
                    label={`문구 ${index + 1}`}
                    value={quote}
                    onChange={(e) => onChangeQuote(index, e.target.value)}
                    fullWidth
                    size="small"
                    error={error}
                    helperText={error ? "문구를 입력하세요." : " "}
                  />
                  <IconButton
                    aria-label="행 삭제"
                    onClick={() => onRemoveField(index)}
                    disabled={quotes.length === 1}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Stack>
              );
            })}
          </Stack>

          {/* 정보 / 경고 */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 1 }}
          >
            <Chip
              label={`총 ${trimmed.length}개`}
              variant="outlined"
              size="small"
            />
            {hasDuplicate && (
              <Typography variant="caption" color="error">
                중복 문구가 있습니다. 확인해 주세요.
              </Typography>
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* 미리보기(선택/유효한 문구만) */}
          {trimmed.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(primary, 0.06),
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                저장 미리보기
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {trimmed.map((q, i) => (
                  <Chip key={i} label={q} size="small" />
                ))}
              </Stack>
            </Box>
          )}

          {/* 저장 버튼 */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!canSave}
              fullWidth
            >
              Firestore에 저장
            </Button>
            <Button
              variant="text"
              onClick={() => setQuotes([""])}
              fullWidth
            >
              초기화
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 스낵바 */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2200}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.type === "success" ? "success" : "error"}
          variant="filled"
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
