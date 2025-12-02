/**
 * 枪械改装功能页面
 * 
 * 该组件提供枪械改装和成本预测功能，包含：
 * - 武器选择：选择要改装的武器
 * - 槽位配置：显示武器可用的槽位，可安装配件（包括嵌套槽位）
 * - 弹药选择：根据弹匣容量选择弹药数量
 * - 成本计算：计算改装总成本
 * 
 * 数据来源：tarkov.dev GraphQL API
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Slider,
  Alert,
  Stack,
  CircularProgress,
  Autocomplete,
  TextField,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import RefreshIcon from '@mui/icons-material/Refresh';

// 导入API服务
import { fetchWeapons, fetchWeaponDetails, fetchAmmoByCaliber } from '../services/tarkovApi';

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
 * 检查配件是否是弹匣类型
 * @param {object} mod - 配件对象
 * @returns {boolean} 是否是弹匣
 */
const isMagazineMod = (mod) => {
  return mod?.properties?.capacity !== undefined;
};

/**
 * 枪械改装页面组件
 * @returns {JSX.Element} 枪械改装页面
 */
const WeaponBuild = () => {
  // 武器列表状态
  const [weapons, setWeapons] = useState([]);
  const [weaponsLoading, setWeaponsLoading] = useState(true);
  const [weaponsError, setWeaponsError] = useState(null);

  // 选中的武器ID和详细信息
  const [selectedWeaponId, setSelectedWeaponId] = useState('');
  const [weaponDetails, setWeaponDetails] = useState(null);
  const [weaponDetailsLoading, setWeaponDetailsLoading] = useState(false);

  // 已安装的配件 { slotId: modItem }
  const [installedMods, setInstalledMods] = useState({});

  // 弹药相关状态
  const [availableAmmo, setAvailableAmmo] = useState([]);
  const [ammoLoading, setAmmoLoading] = useState(false);
  const [selectedAmmoId, setSelectedAmmoId] = useState('');
  const [ammoCount, setAmmoCount] = useState(0);

  // 加载武器列表
  useEffect(() => {
    const loadWeapons = async () => {
      try {
        setWeaponsLoading(true);
        setWeaponsError(null);
        const data = await fetchWeapons();
        // 按名称排序
        const sortedWeapons = data.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
        setWeapons(sortedWeapons);
      } catch (error) {
        console.error('加载武器列表失败:', error);
        setWeaponsError('加载武器列表失败，请检查网络连接');
      } finally {
        setWeaponsLoading(false);
      }
    };

    loadWeapons();
  }, []);

  // 加载选中武器的详细信息
  useEffect(() => {
    const loadWeaponDetails = async () => {
      if (!selectedWeaponId) {
        setWeaponDetails(null);
        return;
      }

      try {
        setWeaponDetailsLoading(true);
        const details = await fetchWeaponDetails(selectedWeaponId);
        setWeaponDetails(details);

        // 加载该武器口径的弹药
        if (details?.properties?.caliber) {
          setAmmoLoading(true);
          const ammoData = await fetchAmmoByCaliber(details.properties.caliber);
          // 按穿透力排序
          const sortedAmmo = ammoData.sort((a, b) => 
            (b.properties?.penetrationPower || 0) - (a.properties?.penetrationPower || 0)
          );
          setAvailableAmmo(sortedAmmo);
          setAmmoLoading(false);
        }
      } catch (error) {
        console.error('加载武器详情失败:', error);
      } finally {
        setWeaponDetailsLoading(false);
      }
    };

    loadWeaponDetails();
  }, [selectedWeaponId]);

  // 获取选中的弹药对象（缓存避免重复查找）
  const selectedAmmo = useMemo(() => {
    if (!selectedAmmoId) return null;
    return availableAmmo.find(a => a.id === selectedAmmoId) || null;
  }, [selectedAmmoId, availableAmmo]);

  // 获取已安装的弹匣信息
  const installedMagazine = useMemo(() => {
    // 查找弹匣槽位
    const magSlot = Object.entries(installedMods).find(([, mod]) => {
      return mod?.properties?.capacity !== undefined;
    });
    return magSlot ? magSlot[1] : null;
  }, [installedMods]);

  // 弹匣容量
  const magazineCapacity = useMemo(() => {
    return installedMagazine?.properties?.capacity || 0;
  }, [installedMagazine]);

  // 计算总成本
  const totalCost = useMemo(() => {
    let cost = 0;

    // 武器价格
    if (weaponDetails) {
      cost += weaponDetails.avg24hPrice || weaponDetails.basePrice || 0;
    }

    // 配件价格
    Object.values(installedMods).forEach(mod => {
      if (mod) {
        cost += mod.avg24hPrice || mod.basePrice || 0;
      }
    });

    // 弹药价格
    if (selectedAmmo && ammoCount > 0) {
      cost += (selectedAmmo.avg24hPrice || selectedAmmo.basePrice || 0) * ammoCount;
    }

    return cost;
  }, [weaponDetails, installedMods, selectedAmmo, ammoCount]);

  // 处理武器选择
  const handleWeaponChange = useCallback((event, newValue) => {
    setSelectedWeaponId(newValue?.id || '');
    setInstalledMods({});
    setSelectedAmmoId('');
    setAmmoCount(0);
    setAvailableAmmo([]);
  }, []);

  // 处理配件选择
  const handleModChange = useCallback((slotId, modItem) => {
    setInstalledMods(prev => {
      const newMods = { ...prev };
      if (modItem) {
        newMods[slotId] = modItem;
      } else {
        delete newMods[slotId];
      }
      return newMods;
    });

    // 如果更换的是弹匣类型的配件，重置弹药数量
    if (isMagazineMod(modItem) || isMagazineMod(installedMods[slotId])) {
      setAmmoCount(0);
    }
  }, [installedMods]);

  // 处理弹药选择
  const handleAmmoChange = useCallback((event) => {
    const newAmmoId = event.target.value;
    setSelectedAmmoId(newAmmoId);
    // 如果有弹匣，设置默认弹药数量为弹匣容量
    if (magazineCapacity > 0 && newAmmoId) {
      setAmmoCount(magazineCapacity);
    }
  }, [magazineCapacity]);

  // 处理弹药数量变化
  const handleAmmoCountChange = useCallback((event, newValue) => {
    setAmmoCount(newValue);
  }, []);

  // 重置所有选择
  const handleReset = useCallback(() => {
    setSelectedWeaponId('');
    setWeaponDetails(null);
    setInstalledMods({});
    setSelectedAmmoId('');
    setAmmoCount(0);
    setAvailableAmmo([]);
  }, []);

  // 获取武器的槽位列表
  const weaponSlots = useMemo(() => {
    return weaponDetails?.properties?.slots || [];
  }, [weaponDetails]);

  // 渲染槽位配件选择器
  const renderSlotSelector = (slot) => {
    const allowedItems = slot.filters?.flatMap(f => f.allowedItems || []) || [];
    const selectedMod = installedMods[slot.id];

    return (
      <Grid size={{ xs: 12, sm: 6 }} key={slot.id}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {slot.name}
              {slot.required && <Typography component="span" color="error.main"> *</Typography>}
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedMod?.id || ''}
                onChange={(e) => {
                  const mod = allowedItems.find(item => item.id === e.target.value);
                  handleModChange(slot.id, mod || null);
                }}
                displayEmpty
              >
                <MenuItem value="">
                  <em>未安装</em>
                </MenuItem>
                {allowedItems.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                    {item.properties?.capacity && ` (${item.properties.capacity}发)`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 显示已选配件信息 */}
            {selectedMod && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  src={selectedMod.image8xLink}
                  variant="rounded"
                  sx={{ width: 40, height: 40, bgcolor: 'background.default' }}
                />
                <Typography variant="caption" color="success.main">
                  {formatPrice(selectedMod.avg24hPrice || selectedMod.basePrice)} ₽
                </Typography>
              </Box>
            )}

            {/* 渲染配件的子槽位 */}
            {selectedMod?.properties?.slots && selectedMod.properties.slots.length > 0 && (
              <Box sx={{ mt: 2, pl: 1, borderLeft: '2px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  配件槽位:
                </Typography>
                {selectedMod.properties.slots.map(subSlot => renderSlotSelector(subSlot))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg">
      {/* 页面标题区域 */}
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'text.primary' }}>
          枪械改装
        </Typography>
        <Typography variant="body1" color="text.secondary">
          选择武器并配置配件，计算改装总成本（数据来自 tarkov.dev API）
        </Typography>
      </Box>

      {/* 加载错误提示 */}
      {weaponsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {weaponsError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 左侧：武器选择和配置区域 */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* 武器选择 */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BuildIcon color="primary" />
              选择武器
            </Typography>

            {weaponsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Autocomplete
                options={weapons}
                getOptionLabel={(option) => `${option.name} (${option.properties?.caliber || '未知口径'})`}
                value={weapons.find(w => w.id === selectedWeaponId) || null}
                onChange={handleWeaponChange}
                renderInput={(params) => (
                  <TextField {...params} label="搜索武器" placeholder="输入武器名称..." />
                )}
                renderOption={(props, option) => {
                  const { key, ...restProps } = props;
                  return (
                    <Box component="li" key={key} {...restProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={option.image8xLink}
                        variant="rounded"
                        sx={{ width: 40, height: 40, bgcolor: 'background.default' }}
                      />
                      <Box>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.properties?.caliber || '未知口径'}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
                sx={{ mt: 2 }}
              />
            )}

            {/* 武器预览 */}
            {weaponDetailsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : weaponDetails && (
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <CardMedia
                  component="img"
                  image={weaponDetails.image8xLink}
                  alt={weaponDetails.name}
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
                    {weaponDetails.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    口径: {weaponDetails.properties?.caliber || '未知'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    人机工效: {weaponDetails.properties?.ergonomics || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    市场价: {formatPrice(weaponDetails.avg24hPrice)} ₽
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>

          {/* 配件配置 */}
          {weaponDetails && weaponSlots.length > 0 && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="primary" />
                配件配置
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                {weaponSlots.map(slot => renderSlotSelector(slot))}
              </Grid>
            </Paper>
          )}

          {/* 弹药配置 */}
          {weaponDetails && installedMagazine && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                弹药配置
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                已安装弹匣: {installedMagazine.name} (容量: {magazineCapacity}发)
              </Alert>

              {ammoLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <>
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
                          {ammo.name} - {formatPrice(ammo.avg24hPrice || ammo.basePrice)} ₽/发
                          {ammo.properties?.penetrationPower && ` (穿透: ${ammo.properties.penetrationPower})`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedAmmo && (
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
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={selectedAmmo.image8xLink}
                          variant="rounded"
                          sx={{ width: 48, height: 48, bgcolor: 'background.default' }}
                        />
                        <Box>
                          <Typography variant="body2">
                            穿透: {selectedAmmo.properties?.penetrationPower || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            伤害: {selectedAmmo.properties?.damage || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            弹药费用: {formatPrice((selectedAmmo.avg24hPrice || selectedAmmo.basePrice || 0) * ammoCount)} ₽
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Paper>
          )}
        </Grid>

        {/* 右侧：成本计算区域 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon color="primary" />
              成本计算
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* 武器成本 */}
            {weaponDetails && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  武器
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }}>
                    {weaponDetails.name}
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ whiteSpace: 'nowrap' }}>
                    {formatPrice(weaponDetails.avg24hPrice || weaponDetails.basePrice)} ₽
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
                  {Object.entries(installedMods).map(([slotId, mod]) => {
                    if (!mod) return null;
                    return (
                      <ListItem key={slotId} disablePadding sx={{ py: 0.5 }}>
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
                          {formatPrice(mod.avg24hPrice || mod.basePrice)} ₽
                        </Typography>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}

            {/* 弹药成本 */}
            {selectedAmmo && ammoCount > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  弹药
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }}>
                    {selectedAmmo.name} × {ammoCount}
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ whiteSpace: 'nowrap' }}>
                    {formatPrice((selectedAmmo.avg24hPrice || selectedAmmo.basePrice || 0) * ammoCount)} ₽
                  </Typography>
                </Box>
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
                startIcon={<RefreshIcon />}
              >
                重置配置
              </Button>
            </Stack>

            {/* 提示信息 */}
            {!weaponDetails && (
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
