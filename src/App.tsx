import { useState } from 'react'
import { Button, Dialog, Form, Input, List, NavBar, ImageUploader, Toast } from 'antd-mobile'
import { WalletOutlined, PlusOutlined, GoldOutlined, ShareAltOutlined } from '@ant-design/icons'
import html2canvas from 'html2canvas'
import { createRoot } from 'react-dom/client'
import './App.css'

const PRESET_ICONS = [
  { icon: '💰', label: '钱袋' },
  { icon: '💵', label: '钞票' },
  { icon: '💳', label: '银行卡' },
  { icon: '🏦', label: '银行' },
  { icon: '💎', label: '珠宝' },
  { icon: '🏠', label: '房产' },
  { icon: '🚗', label: '汽车' },
]

interface Asset {
  id: string
  name: string
  amount: number
  icon?: string
  customIcon?: string
}

function App() {
  const [form] = Form.useForm()
  const [assets, setAssets] = useState<Asset[]>(() => {
    const savedAssets = localStorage.getItem('assets')
    return savedAssets ? JSON.parse(savedAssets) : []
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

  const AssetCard = ({ totalAmount }: { totalAmount: number }) => {
    return (
      <div
        style={{
          width: '300px',
          padding: '32px',
          background: 'linear-gradient(135deg, #DAA520, #FFD700)',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(218, 165, 32, 0.3)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>
            <WalletOutlined />
          </div>
          <div style={{ fontSize: '22px', marginBottom: '8px', fontWeight: '500' }}>
            总资产（元）
          </div>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              letterSpacing: '-0.5px'
            }}
          >
            ¥ {totalAmount.toLocaleString()}
          </div>
        </div>
        <div
          style={{
            textAlign: 'center',
            fontSize: '14px',
            opacity: '0.9',
            fontWeight: '500'
          }}
        >
          钱宝记 - 您的资产管理助手
        </div>
      </div>
    )
  }

  const generateAssetCard = async (totalAmount: number) => {
    try {
      Toast.show({
        icon: 'loading',
        content: '正在生成资产卡片...',
        duration: 0
      })
    
      const cardContainer = document.createElement('div')
      cardContainer.style.position = 'absolute'
      cardContainer.style.top = '-9999px'
      cardContainer.style.left = '-9999px'
      document.body.appendChild(cardContainer)
    
      const root = createRoot(cardContainer)
      root.render(<AssetCard totalAmount={totalAmount} />)
    
      // 等待组件渲染完成
      await new Promise(resolve => setTimeout(resolve, 500))
    
      const canvas = await html2canvas(cardContainer.firstChild as HTMLElement, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      })
    
      const imgUrl = canvas.toDataURL('image/png')
      
      // 创建一个模态框来显示生成的图片
      Dialog.show({
        title: '资产卡片已生成',
        content: (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={imgUrl} 
              alt="资产卡片" 
              style={{ 
                width: '100%', 
                maxWidth: '300px', 
                marginBottom: '12px' 
              }} 
            />
            <div style={{ fontSize: '14px', color: '#666' }}>
              长按图片可保存到相册
            </div>
          </div>
        ),
        closeOnAction: true,
        actions: [
          {
            key: 'close',
            text: '关闭',
          },
        ],
      })
    
      Toast.clear()
    } catch (error) {
      console.error('生成资产卡片失败:', error)
      Toast.clear()
      Toast.show({
        icon: 'fail',
        content: '生成资产卡片失败'
      })
    } finally {
      const cardContainer = document.querySelector('div[style*="-9999px"]')
      if (cardContainer && cardContainer.parentNode) {
        cardContainer.parentNode.removeChild(cardContainer)
      }
    }
  }

  const onFinish = (values: any) => {
    const newAsset: Asset = {
      id: editingAsset ? editingAsset.id : Date.now().toString(),
      name: values.name,
      amount: Number(values.amount),
      icon: customIcon ? undefined : selectedIcon,
      customIcon: customIcon
    }
  
    let newAssets: Asset[]
    if (editingAsset) {
      newAssets = assets.map(asset => asset.id === editingAsset.id ? newAsset : asset)
    } else {
      newAssets = [...assets, newAsset]
    }

    setAssets(newAssets)
    localStorage.setItem('assets', JSON.stringify(newAssets))
  
    setShowAddDialog(false)
    setEditingAsset(null)
    setCustomIcon(undefined)
    setSelectedIcon(PRESET_ICONS[0].icon)
  }

  const totalAssets = assets.reduce((sum, asset) => sum + asset.amount, 0)

  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0].icon)
  const [customIcon, setCustomIcon] = useState<string>()

  return (
    <div className="app">
      <NavBar back={null}><span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%' }}><GoldOutlined style={{ fontSize: '20px' }} />钱宝记</span></NavBar>
      
      <div className="total-assets">
        <WalletOutlined className="wallet-icon" />
        <div className="amount">
          <div className="label">总资产（元）</div>
          <div className="value">¥ {totalAssets.toLocaleString()}</div>
        </div>
        <Button
          onClick={() => generateAssetCard(totalAssets)}
          style={{
            padding: '4px 8px',
            fontSize: '14px',
            background: 'none',
            border: 'none',
            color: 'white'
          }}
          size='small'
        >
          <ShareAltOutlined style={{ marginRight: '4px' }} />分享
        </Button>
      </div>

      <div className="asset-list">
        <List header="资产列表">
          {assets.map(asset => (
            <List.Item
              key={asset.id}
              prefix={asset.customIcon ? <img src={asset.customIcon} alt="asset icon" style={{ width: 24, height: 24, objectFit: 'cover' }} /> : asset.icon}
              onClick={() => {
                setEditingAsset(asset)
                setSelectedIcon(asset.icon || PRESET_ICONS[0].icon)
                setCustomIcon(asset.customIcon)
                setShowAddDialog(true)
              }}
            >
              <div className="asset-item">
                <span>{asset.name}</span>
                <span className="asset-amount">¥ {asset.amount.toLocaleString()}</span>
              </div>
            </List.Item>
          ))}
        </List>
      </div>

      <Button
        className="add-button"
        onClick={() => setShowAddDialog(true)}
        shape="rounded"
        color="primary"
      >
        <PlusOutlined /> 添加资产
      </Button>

      <Dialog
        visible={showAddDialog}
        title={editingAsset ? "编辑资产" : "添加资产"}
        content={
          <Form
            onFinish={onFinish}
            initialValues={editingAsset ? {
              name: editingAsset.name,
              amount: editingAsset.amount
            } : undefined}
            footer={
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  block
                  onClick={() => {
                    setShowAddDialog(false)
                    setCustomIcon(undefined)
                    setSelectedIcon(PRESET_ICONS[0].icon)
                  }}
                  style={{
                    color: '#DAA520',
                    borderColor: '#DAA520',
                    background: 'transparent'
                  }}
                >
                  取消
                </Button>
                <Button 
                  block 
                  type="submit" 
                  style={{
                    background: 'linear-gradient(135deg, #DAA520, #FFD700)',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  确定
                </Button>
              </div>
            }
            form={form}
          >
            <Form.Item
              name="name"
              label="资产名称"
              rules={[{ required: true }]}
            >
              <Input placeholder="请输入资产名称" />
            </Form.Item>
            <Form.Item
              name="amount"
              label="资产金额"
              rules={[{ required: true }]}
            >
              <Input placeholder="请输入资产金额" type="number" />
            </Form.Item>
            <Form.Item label="资产图标">
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                {PRESET_ICONS.map(({ icon, label }) => (
                  <div
                    key={icon}
                    onClick={() => {
                      setSelectedIcon(icon)
                      setCustomIcon(undefined)
                    }}
                    style={{
                      padding: 8,
                      border: `2px solid ${selectedIcon === icon ? '#1677ff' : '#eee'}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 24
                    }}
                    title={label}
                  >
                    {icon}
                  </div>
                ))}
              </div>
              <ImageUploader
                value={customIcon ? [{ url: customIcon }] : []}
                onChange={files => {
                  if (files.length > 0) {
                    setCustomIcon(files[0].url)
                    setSelectedIcon('')
                  } else {
                    setCustomIcon(undefined)
                    setSelectedIcon(PRESET_ICONS[0].icon)
                  }
                }}
                maxCount={1}
                onDelete={() => {
                  setCustomIcon(undefined)
                  setSelectedIcon(PRESET_ICONS[0].icon)
                }}
                upload={async (file) => {
                  // 这里我们直接将文件转换为base64字符串
                  return new Promise((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onload = () => {
                      resolve({ url: reader.result as string })
                    }
                    reader.onerror = reject
                    reader.readAsDataURL(file)
                  })
                }}
              >
                <Button>上传自定义图标</Button>
              </ImageUploader>
            </Form.Item>
          </Form>
        }
        onClose={() => {
          setShowAddDialog(false)
          setEditingAsset(null)
          setCustomIcon(undefined)
          setSelectedIcon(PRESET_ICONS[0].icon)
          form.resetFields()
        }}
      />
    </div>
  )
}

export default App
