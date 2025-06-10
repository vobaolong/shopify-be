import { RequestHandler } from 'express'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import axios from 'axios'

const GHN_TOKEN = process.env.GHN_TOKEN
const GHN_API_PROVINCE =
  process.env.GHN_API_PROVINCE ||
  'https://online-gateway.ghn.vn/shiip/public-api/master-data/province'
const GHN_API_DISTRICT =
  process.env.GHN_API_DISTRICT ||
  'https://online-gateway.ghn.vn/shiip/public-api/master-data/district'
const GHN_API_WARD =
  process.env.GHN_API_WARD ||
  'https://online-gateway.ghn.vn/shiip/public-api/master-data/ward'

export const getProvinces: RequestHandler = async (req, res) => {
  try {
    console.log('GHN_TOKEN:', GHN_TOKEN ? '***token exists***' : 'undefined')

    if (!GHN_TOKEN) throw new Error('GHN_TOKEN is not set')

    console.log('Calling GHN API:', GHN_API_PROVINCE)
    const response = await axios.get(GHN_API_PROVINCE, {
      headers: { Token: GHN_TOKEN }
    })

    console.log('GHN response status:', response.status)
    console.log('GHN response data:', response.data)

    let provinces = response.data.data || []
    console.log('Provinces count:', provinces.length)

    const search = req.query.search as string
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 100

    if (search) {
      provinces = provinces.filter((province: any) =>
        province.ProvinceName.toLowerCase().includes(search.toLowerCase())
      )
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProvinces = provinces.slice(startIndex, endIndex)

    res.status(200).json({
      success: 'Get provinces successfully',
      provinces: paginatedProvinces,
      total: provinces.length,
      page,
      limit
    })
  } catch (error: any) {
    console.error('Error fetching provinces from GHN:', error.message)
    console.error('Error details:', error.response?.data || error)
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}

export const getDistricts: RequestHandler = async (req, res) => {
  try {
    if (!GHN_TOKEN) throw new Error('GHN_TOKEN is not set')
    const { provinceId } = req.params
    const response = await axios.get(GHN_API_DISTRICT, {
      headers: { Token: GHN_TOKEN },
      params: { province_id: provinceId }
    })
    let districts = response.data.data || []
    const search = req.query.search as string
    if (search) {
      districts = districts.filter((district: any) =>
        district.DistrictName.toLowerCase().includes(search.toLowerCase())
      )
    }
    res.status(200).json({
      success: 'Get districts successfully',
      districts
    })
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}

export const getWards: RequestHandler = async (req, res) => {
  try {
    if (!GHN_TOKEN) throw new Error('GHN_TOKEN is not set')
    const { districtId } = req.params
    const response = await axios.get(GHN_API_WARD, {
      headers: { Token: GHN_TOKEN },
      params: { district_id: districtId }
    })
    let wards = response.data.data || []
    const search = req.query.search as string
    if (search) {
      wards = wards.filter((ward: any) =>
        ward.WardName.toLowerCase().includes(search.toLowerCase())
      )
    }
    res.status(200).json({
      success: 'Get wards successfully',
      wards
    })
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}
