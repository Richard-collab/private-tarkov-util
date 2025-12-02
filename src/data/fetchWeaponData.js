import { request, gql } from 'graphql-request'
import fs from 'fs/promises'

// 获取所有武器及其槽位信息
const weaponsQuery = gql`
{
    items(lang: zh, types: [gun]) {
        id
        name
        image8xLink
        avg24hPrice
        basePrice
        height
        width
        weight
        properties {
            ... on ItemPropertiesWeapon {
                caliber
                defaultAmmo {
                    id
                    name
                }
                fireModes
                fireRate
                ergonomics
                recoilVertical
                recoilHorizontal
                effectiveDistance
                sightingRange
                defaultPreset {
                    id
                    name
                }
            }
        }
        slots: containsItems {
            slot
            quantity
            item {
                id
                name
                image8xLink
                basePrice
                avg24hPrice
            }
        }
    }
}
`

// 获取所有武器改装配件
const modsQuery = gql`
{
    items(lang: zh, categoryNames: ["Weapon mods"]) {
        id
        name
        image8xLink
        avg24hPrice
        basePrice
        height
        width
        weight
        types
        properties {
            ... on ItemPropertiesMod {
                ergonomicsModifier
                recoilModifier
                accuracyModifier
            }
        }
        slots: containsItems {
            slot
            quantity
            item {
                id
                name
            }
        }
    }
}
`

// 获取所有弹药
const ammoQuery = gql`
{
    items(lang: zh, types: [ammo]) {
        id
        name
        image8xLink
        avg24hPrice
        basePrice
        weight
        properties {
            ... on ItemPropertiesAmmo {
                caliber
                damage
                armorDamage
                penetrationPower
                tracer
                tracerColor
                projectileCount
                fragmentationChance
                ricochetChance
            }
        }
    }
}
`

// 获取弹匣数据
const magazineQuery = gql`
{
    items(lang: zh, categoryNames: ["Magazines"]) {
        id
        name
        image8xLink
        avg24hPrice
        basePrice
        height
        width
        weight
        properties {
            ... on ItemPropertiesMagazine {
                capacity
                loadModifier
                ammoCheckModifier
                malfunctionChance
                allowedAmmo {
                    id
                    name
                }
            }
        }
    }
}
`

async function fetchAllData() {
    try {
        console.log('正在获取武器数据...')
        const weaponsData = await request('https://api.tarkov.dev/graphql', weaponsQuery)
        
        console.log('正在获取配件数据...')
        const modsData = await request('https://api.tarkov.dev/graphql', modsQuery)
        
        console.log('正在获取弹药数据...')
        const ammoData = await request('https://api.tarkov.dev/graphql', ammoQuery)
        
        console.log('正在获取弹匣数据...')
        const magazineData = await request('https://api.tarkov.dev/graphql', magazineQuery)
        
        const combinedData = {
            weapons: weaponsData.items,
            mods: modsData.items,
            ammo: ammoData.items,
            magazines: magazineData.items,
            lastUpdated: new Date().toISOString()
        }
        
        await fs.writeFile('weaponData.json', JSON.stringify(combinedData, null, 2))
        console.log('数据已保存到 weaponData.json')
        console.log(`武器数量: ${weaponsData.items.length}`)
        console.log(`配件数量: ${modsData.items.length}`)
        console.log(`弹药数量: ${ammoData.items.length}`)
        console.log(`弹匣数量: ${magazineData.items.length}`)
        
    } catch (error) {
        console.error('获取数据失败:', error)
    }
}

fetchAllData()
