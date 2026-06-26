<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import AppCheckbox from '@/components/common/AppCheckbox.vue'
import AppField from '@/components/common/AppField.vue'
import AppFormActions from '@/components/common/AppFormActions.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import AppTextarea from '@/components/common/AppTextarea.vue'
import EntityPicker from '@/components/common/EntityPicker.vue'
import { reviewDecisions } from '@/services/api/review-decisions'
import { allResources, type ResourceConfig } from '@/services/api/resources'
import { createResource, updateResource } from '@/services/api/resources.api'
import type { EntityRow } from '@/types/domain/common.type'

type FieldKind = 'text' | 'number' | 'boolean' | 'date' | 'enum' | 'fk' | 'textarea'

type ResourceFormProps = {
  resource: ResourceConfig
  pathOverride?: string
  record?: EntityRow | null
  submitLabel?: string
  cancelLabel?: string
}

const props = withDefaults(defineProps<ResourceFormProps>(), {
  pathOverride: undefined,
  record: null,
  submitLabel: undefined,
  cancelLabel: 'Cancelar'
})

const emit = defineEmits<{
  (e: 'saved', value: EntityRow): void
  (e: 'cancel'): void
}>()

const formValues = reactive<Record<string, string | boolean>>({})
const fieldErrors = reactive<Record<string, string>>({})
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const optionalFields = new Set([
  'description',
  'references',
  'known_author',
  'author_id',
  'location_id',
  'old_value',
  'camera_model',
  'codec',
  'mime_type',
  'reason'
])

const enumOptions: Record<string, { value: string; label: string }[]> = {
  status: [
    { value: '', label: 'Selecione' },
    { value: 'draft', label: 'Rascunho' },
    { value: 'pending', label: 'Pendente' },
    { value: 'approved', label: 'Aprovado' },
    { value: 'published', label: 'Publicado' },
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
    { value: 'archived', label: 'Arquivado' },
    { value: 'rejected', label: 'Rejeitado' }
  ],
  type: [
    { value: '', label: 'Selecione' },
    { value: 'image', label: 'Imagem' },
    { value: 'video', label: 'Vídeo' },
    { value: 'document', label: 'Documento' },
    { value: 'audio', label: 'Áudio' },
    { value: 'other', label: 'Outro' }
  ],
  decision: [{ value: '', label: 'Selecione' }, ...reviewDecisions],
  value: [
    { value: '', label: 'Selecione' },
    { value: '1', label: 'Concordo' },
    { value: '0', label: 'Neutro' },
    { value: '-1', label: 'Discordo' }
  ]
}

const fkResourcePathByField: Record<string, string> = {
  author_id: '/users',
  location_id: '/locations',
  information_id: '/information',
  manufacturer_id: '/manufacturers',
  sigo_regional_id: '/sigo-regionals',
  rolling_stock_id: '/rolling-stock',
  gauge_id: '/track-gauges',
  media_id: '/media',
  album_id: '/albums',
  path_id: '/paths',
  state_id: '/states',
  city_id: '/states',
  freight_car_type_id: '/freight-car-types',
  freight_car_category_id: '/freight-car-categories',
  freight_car_gross_weight_type_id: '/freight-car-gross-weight-types',
  passenger_car_type_id: '/passenger-car-types',
  passenger_car_material_id: '/passenger-car-materials',
  non_revenue_car_type_id: '/non-revenue-car-types',
  builder_railroad_id: '/companies',
  design_id: '/locomotive-designs'
}

const writeFields = computed(() => props.resource.writeFields ?? [])
const endpointPath = computed(() => props.pathOverride ?? props.resource.path)
const isEditing = computed(() => Boolean(props.record?.id))
const submitText = computed(
  () => props.submitLabel ?? (isEditing.value ? 'Salvar alterações' : 'Criar')
)

function looksLikeBooleanField(field: string, value: unknown) {
  return typeof value === 'boolean' || field.startsWith('is_') || field.startsWith('has_')
}

function looksLikeNumberField(field: string) {
  return (
    field.endsWith('_number') ||
    field.endsWith('_year') ||
    field.endsWith('_count') ||
    field.includes('latitude') ||
    field.includes('longitude') ||
    field.includes('kilometer') ||
    field === 'order' ||
    field === 'ibge_id' ||
    field === 'duration' ||
    field === 'pages' ||
    field === 'location_route_order'
  )
}

function fieldKind(field: string): FieldKind {
  if (field.endsWith('_id')) {
    return 'fk'
  }
  if (enumOptions[field]) {
    return 'enum'
  }
  if (looksLikeBooleanField(field, props.record?.[field])) {
    return 'boolean'
  }
  if (field.endsWith('_at') || field.endsWith('_date')) {
    return 'date'
  }
  if (looksLikeNumberField(field)) {
    return 'number'
  }
  if (['text', 'description', 'content', 'references', 'reason'].includes(field)) {
    return 'textarea'
  }
  return 'text'
}

function fieldLabel(field: string) {
  return field.replace(/_/g, ' ')
}

function resourcePathForField(field: string) {
  const explicitPath = fkResourcePathByField[field]
  if (explicitPath) {
    return explicitPath
  }

  const fieldEntityType = field.replace(/_id$/, '')
  const byEntityType = allResources.find((resource) => resource.entityType === fieldEntityType)
  return byEntityType?.path
}

function normalizeFieldValue(field: string, value: unknown) {
  const kind = fieldKind(field)
  if (kind === 'boolean') {
    return Boolean(value)
  }
  if (value === null || value === undefined) {
    return ''
  }
  return String(value)
}

function initializeFormValues() {
  for (const field of writeFields.value) {
    formValues[field] = normalizeFieldValue(field, props.record?.[field])
  }
}

function resetFieldErrors() {
  for (const key of Object.keys(fieldErrors)) {
    delete fieldErrors[key]
  }
}

function isFieldRequired(field: string) {
  if (fieldKind(field) === 'boolean') {
    return false
  }
  return !optionalFields.has(field)
}

function validateForm() {
  resetFieldErrors()

  for (const field of writeFields.value) {
    if (!isFieldRequired(field)) {
      continue
    }

    const value = formValues[field]
    if (typeof value === 'boolean') {
      continue
    }

    if (!String(value ?? '').trim()) {
      fieldErrors[field] = 'Campo obrigatório.'
    }
  }

  return Object.keys(fieldErrors).length === 0
}

function parseFieldValue(field: string, raw: string | boolean) {
  const kind = fieldKind(field)
  if (kind === 'boolean') {
    return Boolean(raw)
  }
  if (typeof raw !== 'string') {
    return raw
  }
  if (raw.trim() === '') {
    return null
  }
  if (kind === 'number') {
    const numeric = Number(raw)
    return Number.isFinite(numeric) ? numeric : raw
  }
  if (kind === 'enum' && field === 'value') {
    return Number(raw)
  }
  return raw
}

async function handleSubmit() {
  errorMessage.value = null
  if (!validateForm()) {
    return
  }

  const payload: EntityRow = {}
  for (const field of writeFields.value) {
    const value = parseFieldValue(field, formValues[field])
    if (value !== null) {
      payload[field] = value
    }
  }

  isSubmitting.value = true
  try {
    const response = isEditing.value
      ? await updateResource(endpointPath.value, String(props.record?.id), payload)
      : await createResource(endpointPath.value, payload)
    emit('saved', response)
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível salvar o registro.'
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => [props.record, writeFields.value.join(',')],
  () => {
    initializeFormValues()
    resetFieldErrors()
    errorMessage.value = null
  },
  { immediate: true }
)
</script>

<template>
  <form class="ResourceForm" @submit.prevent="handleSubmit">
    <AppField
      v-for="field in writeFields"
      :key="field"
      :label="fieldLabel(field)"
      :error="fieldErrors[field]"
      :required="isFieldRequired(field)"
    >
      <template #default="{ id, ariaInvalid, ariaDescribedby, required }">
        <EntityPicker
          v-if="fieldKind(field) === 'fk' && resourcePathForField(field)"
          v-model="formValues[field] as string"
          :id="id"
          :resource-path="resourcePathForField(field) as string"
          :label="fieldLabel(field)"
          :hide-label="true"
          :required="required"
          :disabled="isSubmitting"
        />
        <AppCheckbox
          v-else-if="fieldKind(field) === 'boolean'"
          v-model="formValues[field] as boolean"
          :id="id"
          :aria-describedby="ariaDescribedby"
          :disabled="isSubmitting"
        />
        <AppTextarea
          v-else-if="fieldKind(field) === 'textarea'"
          v-model="formValues[field] as string"
          :id="id"
          :required="required"
          :disabled="isSubmitting"
          :aria-invalid="ariaInvalid"
          :aria-describedby="ariaDescribedby"
        />
        <AppSelect
          v-else-if="fieldKind(field) === 'enum'"
          v-model="formValues[field] as string"
          :id="id"
          :required="required"
          :disabled="isSubmitting"
          :aria-invalid="ariaInvalid"
          :aria-describedby="ariaDescribedby"
          :options="enumOptions[field]"
        />
        <AppInput
          v-else
          v-model="formValues[field] as string"
          :id="id"
          :required="required"
          :disabled="isSubmitting"
          :type="
            fieldKind(field) === 'number' ? 'number' : fieldKind(field) === 'date' ? 'date' : 'text'
          "
          :aria-invalid="ariaInvalid"
          :aria-describedby="ariaDescribedby"
        />
      </template>
    </AppField>

    <p v-if="errorMessage" class="ResourceForm-Error" role="alert">{{ errorMessage }}</p>

    <AppFormActions
      :submit-label="submitText"
      :cancel-label="cancelLabel"
      :disable-submit="isSubmitting"
      :disable-cancel="isSubmitting"
      @cancel="emit('cancel')"
    />
  </form>
</template>

<style scoped lang="scss">
.ResourceForm {
  display: grid;
  gap: var(--space-3);

  &-Error {
    margin: 0;
    color: var(--color-danger-normal);
    font-size: var(--font-size-sm);
  }
}
</style>
