#!/bin/bash

# ==============================================
# 塔科夫工具 - 数据更新脚本
# Tarkov Util - Data Update Script
# ==============================================
# 
# 用法: ./scripts/update-data.sh [options]
#
# 选项:
#   --items     仅更新物品数据
#   --tasks     仅更新任务数据
#   --weapons   仅更新武器改装数据
#   --all       更新所有数据 (默认)
#
# 示例:
#   ./scripts/update-data.sh              # 更新所有数据
#   ./scripts/update-data.sh --items      # 仅更新物品数据
#   ./scripts/update-data.sh --weapons    # 仅更新武器改装数据
# ==============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_ROOT/src/data"

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 更新物品数据
update_items() {
    print_info "正在更新物品数据..."
    cd "$DATA_DIR"
    if node fetchNewestItemData.js; then
        print_success "物品数据更新完成"
    else
        print_error "物品数据更新失败"
        return 1
    fi
}

# 更新任务数据
update_tasks() {
    print_info "正在更新任务数据..."
    cd "$DATA_DIR"
    if node fetchTaskData.js; then
        print_success "任务数据更新完成"
    else
        print_error "任务数据更新失败"
        return 1
    fi
}

# 更新武器改装数据
update_weapons() {
    print_info "正在更新武器改装数据..."
    cd "$DATA_DIR"
    if node fetchWeaponData.js; then
        print_success "武器改装数据更新完成"
    else
        print_error "武器改装数据更新失败"
        return 1
    fi
}

# 更新所有数据
update_all() {
    print_info "开始更新所有数据..."
    echo ""
    
    local failed=0
    
    update_items || failed=1
    echo ""
    
    update_tasks || failed=1
    echo ""
    
    update_weapons || failed=1
    echo ""
    
    if [ $failed -eq 0 ]; then
        print_success "所有数据更新完成！"
    else
        print_warning "部分数据更新失败，请检查上方错误信息"
        return 1
    fi
}

# 显示帮助信息
show_help() {
    echo "塔科夫工具 - 数据更新脚本"
    echo ""
    echo "用法: $0 [options]"
    echo ""
    echo "选项:"
    echo "  --items     仅更新物品数据 (items.json)"
    echo "  --tasks     仅更新任务数据 (tasks.json)"
    echo "  --weapons   仅更新武器改装数据 (weaponCache.json)"
    echo "  --all       更新所有数据 (默认)"
    echo "  --help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0              # 更新所有数据"
    echo "  $0 --items      # 仅更新物品数据"
    echo "  $0 --weapons    # 仅更新武器改装数据"
}

# 主函数
main() {
    echo "========================================"
    echo "  塔科夫工具 - 数据更新脚本"
    echo "  Tarkov Util - Data Update Script"
    echo "========================================"
    echo ""

    # 检查是否在项目目录
    if [ ! -d "$DATA_DIR" ]; then
        print_error "找不到数据目录: $DATA_DIR"
        print_error "请确保从项目根目录运行此脚本"
        exit 1
    fi

    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        print_error "未找到 Node.js，请先安装 Node.js"
        exit 1
    fi

    # 解析参数
    case "${1:-}" in
        --items)
            update_items
            ;;
        --tasks)
            update_tasks
            ;;
        --weapons)
            update_weapons
            ;;
        --all|"")
            update_all
            ;;
        --help|-h)
            show_help
            ;;
        *)
            print_error "未知选项: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
