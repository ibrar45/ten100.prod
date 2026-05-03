import { useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CreateHostelForm from '../components/CreateHostelForm'
import AppHeader from '../../shared/components/AppHeader'
import { createHostel } from '../../features/hostels'
import { resolveApiAssetUrl } from '../../shared/apiConfig'
import { PRESET_HOSTEL_AMENITIES, PRESET_HOSTEL_RULES } from '../../shared/hostelListingPresets'

const MAX_FILE_COUNT = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024

const initialForm = {
  name: '',
  code: '',
  genderPolicy: 'boys',
  isShortStayAvailable: false,
  totalFloors: '1',
  contactPhone: '',
  contactAlternatePhone: '',
  contactEmail: '',
  city: '',
  area: '',
  street: '',
  fullAddress: '',
  pincode: '',
  selectedAmenities: [],
  customAmenities: [],
  customAmenityDraft: '',
  selectedRules: [],
  customRules: [],
  customRuleDraft: '',
}

const appendTrimmed = (formData, key, value) => {
  formData.append(key, value?.trim?.() ?? '')
}

const toAbsoluteImageUrl = (path) => {
  return resolveApiAssetUrl(path)
}

export default function CreateHostelView() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [createdHostel, setCreatedHostel] = useState(null)

  const selectedPreviewUrls = useMemo(
    () => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [files],
  )

  const createdImageUrls = useMemo(() => {
    const images = Array.isArray(createdHostel?.images) ? createdHostel.images : []
    return images.map(toAbsoluteImageUrl)
  }, [createdHostel])

  const setField = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const amenityCount =
    (form.selectedAmenities?.length || 0) + (form.customAmenities?.length || 0)
  const ruleCount = (form.selectedRules?.length || 0) + (form.customRules?.length || 0)

  const togglePresetAmenity = (name) => {
    setForm((prev) => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(name)
        ? prev.selectedAmenities.filter((x) => x !== name)
        : [...prev.selectedAmenities, name],
    }))
  }

  const addCustomAmenity = () => {
    const raw = form.customAmenityDraft.trim().replace(/\s+/g, ' ')
    if (!raw) return
    const key = raw.toLowerCase()
    const existing = new Set(
      [...(form.selectedAmenities || []), ...(form.customAmenities || [])].map((x) =>
        String(x).toLowerCase(),
      ),
    )
    if (existing.has(key)) {
      setForm((p) => ({ ...p, customAmenityDraft: '' }))
      return
    }
    setForm((p) => ({
      ...p,
      customAmenities: [...p.customAmenities, raw],
      customAmenityDraft: '',
    }))
  }

  const removeCustomAmenityAt = (index) => {
    setForm((p) => ({
      ...p,
      customAmenities: p.customAmenities.filter((_, i) => i !== index),
    }))
  }

  const togglePresetRule = (name) => {
    setForm((prev) => ({
      ...prev,
      selectedRules: prev.selectedRules.includes(name)
        ? prev.selectedRules.filter((x) => x !== name)
        : [...prev.selectedRules, name],
    }))
  }

  const addCustomRule = () => {
    const raw = form.customRuleDraft.trim().replace(/\s+/g, ' ')
    if (!raw) return
    const key = raw.toLowerCase()
    const existing = new Set(
      [...(form.selectedRules || []), ...(form.customRules || [])].map((x) =>
        String(x).toLowerCase(),
      ),
    )
    if (existing.has(key)) {
      setForm((p) => ({ ...p, customRuleDraft: '' }))
      return
    }
    setForm((p) => ({
      ...p,
      customRules: [...p.customRules, raw],
      customRuleDraft: '',
    }))
  }

  const removeCustomRuleAt = (index) => {
    setForm((p) => ({
      ...p,
      customRules: p.customRules.filter((_, i) => i !== index),
    }))
  }

  const completion = useMemo(() => {
    const checks = [
      form.name.trim(),
      form.city.trim(),
      form.area.trim(),
      form.contactPhone.trim(),
      amenityCount > 0,
      ruleCount > 0,
      files.length > 0,
    ]
    const done = checks.filter(Boolean).length
    return Math.round((done / checks.length) * 100)
  }, [amenityCount, files.length, form.area, form.city, form.contactPhone, form.name, ruleCount])

  const validateAndSetFiles = (fileList) => {
    const nextFiles = Array.from(fileList || [])
    if (nextFiles.length > MAX_FILE_COUNT) {
      setError(`You can upload up to ${MAX_FILE_COUNT} images only.`)
      return
    }
    for (const file of nextFiles) {
      if (!file.type?.startsWith('image/')) {
        setError(`Only image files are allowed. Invalid file: ${file.name}`)
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} is larger than 5MB.`)
        return
      }
    }
    setError('')
    setFiles(nextFiles)
  }

  const onFileChange = (event) => validateAndSetFiles(event.target.files)

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    setCreatedHostel(null)

    const amenities = [...form.selectedAmenities, ...form.customAmenities]
      .map((v) => String(v).trim())
      .filter(Boolean)
    const rules = [...form.selectedRules, ...form.customRules]
      .map((v) => String(v).trim())
      .filter(Boolean)

    if (!form.name.trim()) {
      setError('Hostel name is required.')
      return
    }
    if (!form.area.trim()) {
      setError('Area is required.')
      return
    }
    if (amenities.length === 0) {
      setError('Please add at least one amenity.')
      return
    }
    if (rules.length === 0) {
      setError('Please add at least one rule.')
      return
    }
    if (files.length === 0) {
      setError('Please select at least one image.')
      return
    }

    const formData = new FormData()
    appendTrimmed(formData, 'name', form.name)
    appendTrimmed(formData, 'code', form.code)
    appendTrimmed(formData, 'genderPolicy', form.genderPolicy)
    formData.append('isShortStayAvailable', String(Boolean(form.isShortStayAvailable)))
    formData.append('totalFloors', String(Number(form.totalFloors || 0)))

    appendTrimmed(formData, 'contact.phone', form.contactPhone)
    appendTrimmed(formData, 'contact.alternatePhone', form.contactAlternatePhone)
    appendTrimmed(formData, 'contact.email', form.contactEmail)

    appendTrimmed(formData, 'address.city', form.city)
    appendTrimmed(formData, 'address.area', form.area)
    appendTrimmed(formData, 'address.street', form.street)
    appendTrimmed(formData, 'address.fullAddress', form.fullAddress)
    appendTrimmed(formData, 'address.pincode', form.pincode)

    amenities.forEach((item) => formData.append('amenities[]', item))
    rules.forEach((item) => formData.append('rules[]', item))
    files.forEach((file) => formData.append('images', file))

    setLoading(true)
    try {
      const response = await createHostel(formData)
      const created = response?.data || null
      const hostelId = created?.id || created?._id
      setSuccessMessage(response?.message || 'Hostel created successfully.')
      setCreatedHostel(created)

      if (hostelId) {
        navigate(`/hostels/${hostelId}/rooms/create`, {
          replace: true,
          state: { createdHostel: created },
        })
      }
    } catch (e) {
      const details = e?.payload?.error?.details
      if (Array.isArray(details) && details.length > 0) {
        setError(details.map((d) => `${d.field}: ${d.message}`).join(' | '))
      } else {
        setError(e?.message || 'Failed to create hostel')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />
      <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 px-5 py-5 sm:px-8">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Reach Millions of Buyers on our Platforms
              </h1>
              <p className="mt-1 text-sm text-slate-500">In a few simple steps!</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Listings Information
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Property Price
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Good Property Images
                </span>
              </div>
            </div>
            <div className="rounded-full bg-emerald-100/60 px-4 py-2 text-xs font-semibold text-emerald-800">
              Create Hostel
            </div>
          </div>

          <CreateHostelForm
            form={form}
            setField={setField}
            presetAmenities={PRESET_HOSTEL_AMENITIES}
            presetRules={PRESET_HOSTEL_RULES}
            togglePresetAmenity={togglePresetAmenity}
            addCustomAmenity={addCustomAmenity}
            removeCustomAmenityAt={removeCustomAmenityAt}
            togglePresetRule={togglePresetRule}
            addCustomRule={addCustomRule}
            removeCustomRuleAt={removeCustomRuleAt}
            completion={completion}
            selectedPreviewUrls={selectedPreviewUrls}
            onFileChange={onFileChange}
            loading={loading}
            error={error}
            successMessage={successMessage}
            onSubmit={onSubmit}
          />
        </section>

        {createdHostel && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="text-base font-semibold text-slate-900">Hostel created</h3>
            </div>
            {(() => {
              const hostelId = createdHostel?.id || createdHostel?._id
              if (!hostelId) return null
              return (
                <button
                  type="button"
                  onClick={() => navigate(`/hostels/${hostelId}/rooms/create`)}
                  className="mb-4 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Create Room for this Hostel
                </button>
              )
            })()}
            {createdImageUrls.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {createdImageUrls.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt="Created hostel"
                    className="h-24 w-full rounded-lg border border-slate-200 object-cover"
                  />
                ))}
              </div>
            )}
            <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
              {JSON.stringify(createdHostel, null, 2)}
            </pre>
          </section>
        )}
      </main>
    </div>
  )
}

