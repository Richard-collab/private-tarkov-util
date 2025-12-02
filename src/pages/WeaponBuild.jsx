/**
 * 枪械改装功能页面
 * 
 * 该组件提供枪械改装和成本预测功能，包含：
 * - 武器选择：选择要改装的武器
 * - 槽位配置：显示武器可用的槽位，可安装配件
 * - 弹药选择：根据弹匣容量选择弹药数量
 * - 成本计算：计算改装总成本
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  Container,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Slider,
  Alert,
  Stack,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';

// 导入武器数据
import weaponData from '../data/weaponData.json';

/**
 * 格式化价格显示
 * @param {number|null} price - 价格数值
 * @returns {string} 格式化后的价格字符串
 */
const formatPrice = (price) => {
  if (price === null || price === undefined) {
    return '暂无数据';
  }
  return price.toLocaleString('zh-CN');
};

/**
 * 枪械改装页面组件
 * @returns {JSX.Element} 枪械改装页面
 */
const WeaponBuild = () => {
  // 选中的武器ID
  const [selectedWeaponId, setSelectedWeaponId] = useState('');
  // 已安装的配件 { slotType: modId }
  const [installedMods, setInstalledMods] = useState({});
  // 选择的弹药ID
  const [selectedAmmoId, setSelectedAmmoId] = useState('');
  // 弹药数量
  const [ammoCount, setAmmoCount] = useState(0);

  // 获取选中的武器信息
  const selectedWeapon = useMemo(() => {
    return weaponData.weapons.find(w => w.id === selectedWeaponId);
  }, [selectedWeaponId]);

  // 获取当前武器可用的弹药列表
  const availableAmmo = useMemo(() => {
    if (!selectedWeapon) return [];
    return weaponData.ammo[selectedWeapon.caliber] || [];
  }, [selectedWeapon]);

  // 获取当前安装的弹匣信息
  const installedMagazine = useMemo(() => {
    const magModId = installedMods['magazine'];
    if (!magModId) return null;
    return weaponData.mods[magModId];
  }, [installedMods]);

  // 弹匣容量（决定最大弹药数量）
  const magazineCapacity = useMemo(() => {
    if (!installedMagazine) return 0;
    return installedMagazine.capacity || 0;
  }, [installedMagazine]);

  // 计算总成本
  const totalCost = useMemo(() => {
    let cost = 0;
    
    // 武器基础价格（使用市场价）
    if (selectedWeapon) {
      cost += selectedWeapon.avg24hPrice || selectedWeapon.basePrice || 0;
    }
    
    // 配件价格
    Object.values(installedMods).forEach(modId => {
      const mod = weaponData.mods[modId];
      if (mod) {
        cost += mod.avg24hPrice || mod.basePrice || 0;
      }
    });
    
    // 弹药价格
    if (selectedAmmoId && ammoCount > 0) {
      const ammo = availableAmmo.find(a => a.id === selectedAmmoId);
      if (ammo) {
        cost += (ammo.avg24hPrice || ammo.basePrice || 0) * ammoCount;
      }
    }
    
    return cost;
  }, [selectedWeapon, installedMods, selectedAmmoId, ammoCount, availableAmmo]);

  // 处理武器选择
  const handleWeaponChange = (event) => {
    setSelectedWeaponId(event.target.value);
    setInstalledMods({});
    setSelectedAmmoId('');
    setAmmoCount(0);
  };

  // 处理配件选择
  const handleModChange = (slotType, modId) => {
    setInstalledMods(prev => {
      const newMods = { ...prev };
      if (modId) {
        newMods[slotType] = modId;
      } else {
        delete newMods[slotType];
      }
      return newMods;
    });
    
    // 如果更换弹匣，重置弹药数量
    if (slotType === 'magazine') {
      setAmmoCount(0);
    }
  };

  // 处理弹药选择
  const handleAmmoChange = (event) => {
    setSelectedAmmoId(event.target.value);
    // 如果有弹匣，设置默认弹药数量为弹匣容量
    if (magazineCapacity > 0 && event.target.value) {
      setAmmoCount(magazineCapacity);
    }
  };

  // 处理弹药数量变化
  const handleAmmoCountChange = (event, newValue) => {
    setAmmoCount(newValue);
  };

  // 重置所有选择
  const handleReset = () => {
    setSelectedWeaponId('');
    setInstalledMods({});
    setSelectedAmmoId('');
    setAmmoCount(0);
  };

  return (
    <Container maxWidth="lg">
      {/* 页面标题区域 */}
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'text.primary' }}>
          枪械改装
        </Typography>
        <Typography variant="body1" color="text.secondary">
          选择武器并配置配件，计算改装总成本
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 左侧：武器选择和配置区域 */}
        <Grid item xs={12} md={8}>
          {/* 武器选择 */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BuildIcon color="primary" />
              选择武器
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="weapon-select-label">选择武器</InputLabel>
              <Select
                labelId="weapon-select-label"
                id="weapon-select"
                value={selectedWeaponId}
                label="选择武器"
                onChange={handleWeaponChange}
              >
                <MenuItem value="">
                  <em>请选择武器</em>
                </MenuItem>
                {weaponData.weapons.map((weapon) => (
                  <MenuItem key={weapon.id} value={weapon.id}>
                    {weapon.name} ({weapon.caliber})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 武器预览 */}
            {selectedWeapon && (
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <CardMedia
                  component="img"
                  image={selectedWeapon.image8xLink}
                  alt={selectedWeapon.name}
                  sx={{
                    width: 200,
                    height: 120,
                    objectFit: 'contain',
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    p: 1,
                  }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedWeapon.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    口径: {selectedWeapon.caliber}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    市场价: {formatPrice(selectedWeapon.avg24hPrice)} ₽
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>

          {/* 配件配置 */}
          {selectedWeapon && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="primary" />
                配件配置
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {selectedWeapon.slots.map((slot) => (
                  <Grid item xs={12} sm={6} key={slot.slotType}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          {slot.name}
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            value={installedMods[slot.slotType] || ''}
                            onChange={(e) => handleModChange(slot.slotType, e.target.value)}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>未安装</em>
                            </MenuItem>
                            {slot.allowedItems.map((modId) => {
                              const mod = weaponData.mods[modId];
                              if (!mod) return null;
                              return (
                                <MenuItem key={modId} value={modId}>
                                  {mod.name}
                                  {mod.capacity && ` (${mod.capacity}发)`}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                        
                        {/* 显示已选配件信息 */}
                        {installedMods[slot.slotType] && (
                          <Box sx={{ mt: 1 }}>
                            {weaponData.mods[installedMods[slot.slotType]] && (
                              <>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                  <Avatar
                                    src={weaponData.mods[installedMods[slot.slotType]].image8xLink}
                                    variant="rounded"
                                    sx={{ width: 40, height: 40, bgcolor: 'background.default' }}
                                  />
                                  <Typography variant="caption" color="success.main">
                                    {formatPrice(weaponData.mods[installedMods[slot.slotType]].avg24hPrice)} ₽
                                  </Typography>
                                </Box>
                              </>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* 弹药配置 */}
          {selectedWeapon && installedMagazine && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                弹药配置
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                已安装弹匣: {installedMagazine.name} (容量: {magazineCapacity}发)
              </Alert>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="ammo-select-label">选择弹药</InputLabel>
                <Select
                  labelId="ammo-select-label"
                  id="ammo-select"
                  value={selectedAmmoId}
                  label="选择弹药"
                  onChange={handleAmmoChange}
                >
                  <MenuItem value="">
                    <em>请选择弹药</em>
                  </MenuItem>
                  {availableAmmo.map((ammo) => (
                    <MenuItem key={ammo.id} value={ammo.id}>
                      {ammo.name} - {formatPrice(ammo.avg24hPrice)} ₽/发
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedAmmoId && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    弹药数量: {ammoCount}发
                  </Typography>
                  <Slider
                    value={ammoCount}
                    onChange={handleAmmoCountChange}
                    min={0}
                    max={magazineCapacity}
                    step={1}
                    marks={[
                      { value: 0, label: '0' },
                      { value: magazineCapacity, label: `${magazineCapacity}` },
                    ]}
                    valueLabelDisplay="auto"
                  />
                  
                  {/* 弹药信息 */}
                  {availableAmmo.find(a => a.id === selectedAmmoId) && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={availableAmmo.find(a => a.id === selectedAmmoId).image8xLink}
                        variant="rounded"
                        sx={{ width: 48, height: 48, bgcolor: 'background.default' }}
                      />
                      <Box>
                        <Typography variant="body2">
                          穿透: {availableAmmo.find(a => a.id === selectedAmmoId).penetration}
                        </Typography>
                        <Typography variant="body2">
                          伤害: {availableAmmo.find(a => a.id === selectedAmmoId).damage}
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          弹药费用: {formatPrice((availableAmmo.find(a => a.id === selectedAmmoId).avg24hPrice || 0) * ammoCount)} ₽
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          )}
        </Grid>

        {/* 右侧：成本计算区域 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon color="primary" />
              成本计算
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            {/* 武器成本 */}
            {selectedWeapon && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  武器
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }}>
                    {selectedWeapon.name}
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ whiteSpace: 'nowrap' }}>
                    {formatPrice(selectedWeapon.avg24hPrice)} ₽
                  </Typography>
                </Box>
              </Box>
            )}
            
            {/* 配件成本 */}
            {Object.keys(installedMods).length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  配件
                </Typography>
                <List dense disablePadding>
                  {Object.entries(installedMods).map(([slotType, modId]) => {
                    const mod = weaponData.mods[modId];
                    if (!mod) return null;
                    return (
                      <ListItem key={slotType} disablePadding sx={{ py: 0.5 }}>
                        <ListItemAvatar sx={{ minWidth: 36 }}>
                          <Avatar
                            src={mod.image8xLink}
                            variant="rounded"
                            sx={{ width: 28, height: 28, bgcolor: 'background.default' }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={mod.name}
                          primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                        />
                        <Typography variant="body2" color="success.main" sx={{ ml: 1, whiteSpace: 'nowrap' }}>
                          {formatPrice(mod.avg24hPrice)} ₽
                        </Typography>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}
            
            {/* 弹药成本 */}
            {selectedAmmoId && ammoCount > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  弹药
                </Typography>
                {availableAmmo.find(a => a.id === selectedAmmoId) && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }}>
                      {availableAmmo.find(a => a.id === selectedAmmoId).name} × {ammoCount}
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ whiteSpace: 'nowrap' }}>
                      {formatPrice((availableAmmo.find(a => a.id === selectedAmmoId).avg24hPrice || 0) * ammoCount)} ₽
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            {/* 总计 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                总计
              </Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                {formatPrice(totalCost)} ₽
              </Typography>
            </Box>
            
            {/* 操作按钮 */}
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                fullWidth
              >
                重置配置
              </Button>
            </Stack>
            
            {/* 提示信息 */}
            {!selectedWeapon && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <BuildIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  请选择武器开始改装
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WeaponBuild;
