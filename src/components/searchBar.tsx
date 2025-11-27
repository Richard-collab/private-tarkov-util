import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

const SearchBar: React.FC<{ onSearch: (keyword: string) => void }> = ({ onSearch }) => {
  const [keyword, setKeyword] = useState('');

  const handleSearch = () => {
    onSearch(keyword);
  };

  return (
    <Box display="flex" gap={2} alignItems="center" sx={{ mb: 2 }}>
      <TextField
        label="搜索"
        variant="outlined"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        size="small"
      />
      <Button variant="contained" onClick={handleSearch}>
        搜索
      </Button>
    </Box>
  );
};

export default SearchBar;