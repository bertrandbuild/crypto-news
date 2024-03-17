import lighthouse from '@lighthouse-web3/sdk'
const apiKey = process.env.FILECOIN_KEY || '4596b06d.957d54a85ee34f648775a805cb0c2e3b'

// function to uploadText
export const uploadText = async (text) => {
  try {
    return await lighthouse.uploadText(text, apiKey)
  } catch (error) {
    console.error(error)
  }
}

export const getFileUrl = (hashOrCid) => {
  return `https://gateway.lighthouse.storage/ipfs/${hashOrCid}`
}