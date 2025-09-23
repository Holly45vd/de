// src/components/DiaryList.jsx
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DiaryCard from "./DiaryCard";

export default function DiaryList({ diaries }) {
  const navigate = useNavigate();

  return (
    <Grid container spacing={2}>
      {diaries.map((diary) => (
        <Grid item xs={12} sm={6} md={4} key={diary.id}>
          {/* ✅ id가 undefined로 가지 않도록 수정 */}
          <DiaryCard
            diary={diary}
            onClick={() => navigate(`/diary/${diary.id}`)}
          />
        </Grid>
      ))}
    </Grid>
  );
}
