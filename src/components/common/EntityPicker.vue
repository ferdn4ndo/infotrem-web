<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { allResources } from '@/services/api/resources'
import { getResource, listResource } from '@/services/api/resources.api'
import { search } from '@/services/api/search.api'
import type { EntityRow } from '@/types/domain/common.type'

export interface EntityPickerProps {
  id?: string
  modelValue?: string | null
  resourcePath: string
  entityType?: string
  label?: string
  hideLabel?: boolean
  placeholder?: string
  disabled?: boolean
  required?: boolean
  displayFields?: string[]
}

const props = withDefaults(defineProps<EntityPickerProps>(), {
  id: undefined,
  modelValue: null,
  entityType: undefined,
  label: 'Selecionar',
  hideLabel: false,
  placeholder: 'Digite para buscar',
  disabled: false,
  required: false,
  displayFields: () => ['name', 'title', 'code', 'abbrev', 'id']
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'select', id: string | null): void
}>()

const resolvedEntityType = computed(
  () =>
    props.entityType ??
    allResources.find((resource) => resource.path === props.resourcePath)?.entityType
)
const listboxId = `entity-picker-list-${Math.random().toString(16).slice(2)}`

const query = ref('')
const candidates = ref<EntityRow[]>([])
const selectedName = ref<string | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const openSuggestions = ref(false)

let searchDebounceHandle: ReturnType<typeof setTimeout> | null = null
let activeSearchController: AbortController | null = null
let activeResolveController: AbortController | null = null

function stringField(row: EntityRow | null, field: string) {
  const value = row?.[field]
  if (value === null || value === undefined || value === '') {
    return null
  }
  return String(value)
}

function entityLabel(row: EntityRow) {
  for (const field of props.displayFields) {
    const value = stringField(row, field)
    if (value) {
      return value
    }
  }
  return 'Registro sem identificação'
}

function rowId(row: EntityRow) {
  return stringField(row, 'id')
}

async function runSearch() {
  const term = query.value.trim()

  activeSearchController?.abort()
  const controller = new AbortController()
  activeSearchController = controller
  isLoading.value = true
  errorMessage.value = null

  try {
    if (!term) {
      const response = await listResource(
        props.resourcePath,
        { limit: 10, offset: 0 },
        { signal: controller.signal }
      )
      if (controller.signal.aborted) {
        return
      }
      candidates.value = response.items
      return
    }

    const globalSearch = await search(term, 20, { signal: controller.signal })
    if (controller.signal.aborted) {
      return
    }
    const filtered = resolvedEntityType.value
      ? globalSearch.items.filter((item) => item.entity_type === resolvedEntityType.value)
      : globalSearch.items

    if (filtered.length > 0) {
      candidates.value = filtered
      return
    }

    const fallback = await listResource(
      props.resourcePath,
      { limit: 20, offset: 0 },
      { signal: controller.signal }
    )
    if (controller.signal.aborted) {
      return
    }
    candidates.value = fallback.items.filter((item) =>
      entityLabel(item).toLocaleLowerCase('pt-BR').includes(term.toLocaleLowerCase('pt-BR'))
    )
  } catch (error) {
    if (controller.signal.aborted) {
      return
    }
    candidates.value = []
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível buscar registros.'
  } finally {
    if (!controller.signal.aborted) {
      isLoading.value = false
    }
  }
}

function scheduleSearch() {
  if (searchDebounceHandle) {
    clearTimeout(searchDebounceHandle)
  }
  searchDebounceHandle = setTimeout(() => {
    void runSearch()
  }, 300)
}

async function resolveSelected() {
  if (!props.modelValue) {
    selectedName.value = null
    return
  }

  activeResolveController?.abort()
  const controller = new AbortController()
  activeResolveController = controller

  try {
    const row = await getResource(props.resourcePath, props.modelValue, {
      signal: controller.signal
    })
    if (controller.signal.aborted) {
      return
    }
    selectedName.value = entityLabel(row)
  } catch (error) {
    if (controller.signal.aborted) {
      return
    }
    selectedName.value = null
    console.warn('[EntityPicker] Failed to resolve selected relation name.', error)
  }
}

function selectRow(row: EntityRow) {
  const id = rowId(row)
  if (!id) {
    return
  }

  selectedName.value = entityLabel(row)
  query.value = ''
  openSuggestions.value = false
  emit('update:modelValue', id)
  emit('select', id)
}

function clearSelection() {
  selectedName.value = null
  emit('update:modelValue', null)
  emit('select', null)
}

watch(
  () => query.value,
  () => {
    openSuggestions.value = true
    scheduleSearch()
  }
)

watch(
  () => props.modelValue,
  () => {
    void resolveSelected()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (searchDebounceHandle) {
    clearTimeout(searchDebounceHandle)
  }
  activeSearchController?.abort()
  activeResolveController?.abort()
})
</script>

<template>
  <div class="EntityPicker">
    <label v-if="!hideLabel" class="EntityPicker-Label" :for="id">{{ label }}</label>
    <div class="EntityPicker-InputRow">
      <input
        :id="id"
        v-model="query"
        class="EntityPicker-Input"
        type="search"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="openSuggestions && candidates.length > 0"
        :aria-controls="listboxId"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required && !modelValue"
        @focus="openSuggestions = true"
      />
      <button
        v-if="modelValue"
        type="button"
        class="EntityPicker-Clear"
        :disabled="disabled"
        aria-label="Limpar seleção"
        @click="clearSelection"
      >
        Limpar
      </button>
    </div>

    <p v-if="selectedName" class="EntityPicker-Selected">
      Selecionado: <strong>{{ selectedName }}</strong>
    </p>
    <p v-if="isLoading" class="EntityPicker-State">Buscando registros...</p>
    <p v-if="errorMessage" class="EntityPicker-Error" role="alert">{{ errorMessage }}</p>

    <ul
      v-if="openSuggestions && candidates.length > 0"
      :id="listboxId"
      class="EntityPicker-List"
      role="listbox"
    >
      <li
        v-for="candidate in candidates"
        :key="String(candidate.id ?? entityLabel(candidate))"
        class="EntityPicker-Option"
        role="option"
        :aria-selected="rowId(candidate) === modelValue"
      >
        <button
          type="button"
          class="EntityPicker-OptionButton"
          :disabled="disabled"
          @click="selectRow(candidate)"
        >
          {{ entityLabel(candidate) }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.EntityPicker {
  display: grid;
  gap: var(--space-2);

  &-Label {
    color: var(--color-heading);
    font-size: var(--font-size-sm);
    font-weight: $font-weight-bold;
  }

  &-InputRow {
    display: flex;
    gap: var(--space-2);
  }

  &-Input {
    width: 100%;
    min-height: 36px;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-background-soft);
    color: var(--color-text);
    font-size: var(--font-size-md);
  }

  &-Clear,
  &-OptionButton {
    min-height: 36px;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-background-soft);
    color: var(--color-text);
    cursor: pointer;
  }

  &-Input,
  &-Clear,
  &-OptionButton {
    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary-border);
      outline-offset: 2px;
    }
  }

  &-Selected,
  &-State {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  &-Error {
    margin: 0;
    color: var(--color-danger-normal);
    font-size: var(--font-size-sm);
  }

  &-List {
    display: grid;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &-OptionButton {
    width: 100%;
    text-align: left;
  }
}
</style>
