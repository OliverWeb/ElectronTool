export default {
  'category-controller': {
    'activeOrDisableUsingGet': {
      'url': '/api/category/activeOrDisable',
      'method': 'get'
    },
    'createUsingPost': {
      'url': '/api/category/create',
      'method': 'post'
    },
    'isRepeatUsingGet': {
      'url': '/api/category/isRepeat',
      'method': 'get'
    },
    'treeUsingGet': {
      'url': '/api/category/tree',
      'method': 'get'
    },
    'updateUsingPut': {
      'url': '/api/category/update',
      'method': 'put'
    }
  },
  'customer-controller': {
    'customerUsingPost': {
      'url': '/api/customer',
      'method': 'post'
    },
    'isRepeatUsingGet': {
      'url': '/api/customer/isRepeat',
      'method': 'get'
    },
    'pageUsingGet': {
      'url': '/api/customer/page',
      'method': 'get'
    },
    'statusUpdateUsingPut': {
      'url': '/api/customer/statusUpdate',
      'method': 'put'
    },
    'customerIdUsingGet': {
      'url': '/api/customer/{customerId}',
      'method': 'get'
    }
  },
  'equipment-controller': {
    'equipmentUsingPost': {
      'url': '/api/equipment',
      'method': 'post'
    },
    'categoryUsingGet': {
      'url': '/api/equipment/category',
      'method': 'get'
    },
    'getListUsingGet': {
      'url': '/api/equipment/getList',
      'method': 'get'
    },
    'isRepeatUsingGet': {
      'url': '/api/equipment/isRepeat',
      'method': 'get'
    },
    'statusUpdateUsingPut': {
      'url': '/api/equipment/statusUpdate',
      'method': 'put'
    },
    'equipmentIdUsingGet': {
      'url': '/api/equipment/{equipmentId}',
      'method': 'get'
    }
  },
  'equipment-definition-controller': {
    'equipmentDefinitionUsingPost': {
      'url': '/api/equipmentDefinition',
      'method': 'post'
    },
    'categoryUsingGet': {
      'url': '/api/equipmentDefinition/category',
      'method': 'get'
    },
    'isRepeatUsingGet': {
      'url': '/api/equipmentDefinition/isRepeat',
      'method': 'get'
    },
    'statusUpdateUsingPut': {
      'url': '/api/equipmentDefinition/statusUpdate',
      'method': 'put'
    },
    'equipmentDefinitionIdUsingGet': {
      'url': '/api/equipmentDefinition/{equipmentDefinitionId}',
      'method': 'get'
    }
  },
  'equipment-failure-controller': {
    'equipmentFailureUsingPost': {
      'url': '/api/equipmentFailure',
      'method': 'post'
    },
    'equipmentFailureIdUsingGet': {
      'url': '/api/equipmentFailure/{equipmentFailureId}',
      'method': 'get'
    },
    'pageUsingGet': {
      'url': '/api/equipmentFailure/page',
      'method': 'get'
    },
    'statusUpdateUsingPut': {
      'url': '/api/equipmentFailure/statusUpdate',
      'method': 'put'
    }
  },
  'equipment-failure-process-controller': {
    'equipmentFailureProcessUsingPost': {
      'url': '/api/equipmentFailureProcess',
      'method': 'post'
    },
    'pageUsingGet': {
      'url': '/api/equipmentFailureProcess/page',
      'method': 'get'
    },
    'equipFailureIdUsingGet': {
      'url': '/api/equipmentFailureProcess/{equipFailureId}',
      'method': 'get'
    },
    'equipmentFailureProcessIdUsingDelete': {
      'url': '/api/equipmentFailureProcess/{equipmentFailureProcessId}',
      'method': 'delete'
    }
  },
  'equipment-failure-process-spare-part-controller': {
    'equipmentFailureProcessSparePartUsingPut': {
      'url': '/api/equipmentFailureProcessSparePart',
      'method': 'put'
    },
    'pageUsingGet': {
      'url': '/api/equipmentFailureProcessSparePart/page',
      'method': 'get'
    },
    'equipmentFailureProcessSparePartIdUsingDelete': {
      'url': '/api/equipmentFailureProcessSparePart/{equipmentFailureProcessSparePartId}',
      'method': 'delete'
    }
  },
  'equipment-maintenance-result-controller': {
    'equipmentMaintenanceResultUsingPost': {
      'url': '/api/equipmentMaintenanceResult',
      'method': 'post'
    },
    'resultIdUsingGet': {
      'url': '/api/equipmentMaintenanceResult/{resultId}',
      'method': 'get'
    }
  },
  'equipment-maintenance-result-item-controller': {
    'equipmentMaintenanceResultItemUsingPost': {
      'url': '/api/equipmentMaintenanceResultItem',
      'method': 'post'
    },
    'resultIdUsingDelete': {
      'url': '/api/equipmentMaintenanceResultItem/deleteItem/{resultId}',
      'method': 'delete'
    },
    'pageUsingGet': {
      'url': '/api/equipmentMaintenanceResultItem/page',
      'method': 'get'
    },
    'equipmentMaintenanceResultItemIdUsingDelete': {
      'url': '/api/equipmentMaintenanceResultItem/{equipmentMaintenanceResultItemId}',
      'method': 'delete'
    }
  },
  'equipment-maintenance-schedule-controller': {
    'equipmentMaintenanceScheduleUsingPost': {
      'url': '/api/equipmentMaintenanceSchedule',
      'method': 'post'
    },
    'scheduleIdUsingDelete': {
      'url': '/api/equipmentMaintenanceSchedule/deleteRelevance/{scheduleId}',
      'method': 'delete'
    },
    'pageUsingGet': {
      'url': '/api/equipmentMaintenanceSchedule/page',
      'method': 'get'
    },
    'equipmentMaintenanceScheduleIdUsingDelete': {
      'url': '/api/equipmentMaintenanceSchedule/{equipmentMaintenanceScheduleId}',
      'method': 'delete'
    },
    'scheduleIdUsingGet': {
      'url': '/api/equipmentMaintenanceSchedule/{scheduleId}',
      'method': 'get'
    }
  },
  'equipment-maintenance-task-controller': {
    'equipmentMaintenanceTaskUsingPut': {
      'url': '/api/equipmentMaintenanceTask',
      'method': 'put'
    },
    'deleteTasksUsingDelete': {
      'url': '/api/equipmentMaintenanceTask/deleteTasks',
      'method': 'delete'
    },
    'pageUsingGet': {
      'url': '/api/equipmentMaintenanceTask/page',
      'method': 'get'
    },
    'statusUpdateUsingPut': {
      'url': '/api/equipmentMaintenanceTask/statusUpdate',
      'method': 'put'
    },
    'equipmentMaintenanceTaskIdUsingDelete': {
      'url': '/api/equipmentMaintenanceTask/{equipmentMaintenanceTaskId}',
      'method': 'delete'
    },
    'taskIdUsingGet': {
      'url': '/api/equipmentMaintenanceTask/{taskId}',
      'method': 'get'
    }
  },
  'equipment-maintenance-template-controller': {
    'equipmentMaintenanceTemplateUsingPost': {
      'url': '/api/equipmentMaintenanceTemplate',
      'method': 'post'
    },
    'pageUsingGet': {
      'url': '/api/equipmentMaintenanceTemplate/page',
      'method': 'get'
    },
    'statusUpdateUsingPut': {
      'url': '/api/equipmentMaintenanceTemplate/statusUpdate',
      'method': 'put'
    },
    'templateIdUsingGet': {
      'url': '/api/equipmentMaintenanceTemplate/{templateId}',
      'method': 'get'
    }
  },
  'equipment-maintenance-template-item-controller': {
    'equipmentMaintenanceTemplateItemUsingPut': {
      'url': '/api/equipmentMaintenanceTemplateItem',
      'method': 'put'
    },
    'pageUsingGet': {
      'url': '/api/equipmentMaintenanceTemplateItem/page',
      'method': 'get'
    },
    'equipmentMaintenanceTemplateItemIdUsingDelete': {
      'url': '/api/equipmentMaintenanceTemplateItem/{equipmentMaintenanceTemplateItemId}',
      'method': 'delete'
    }
  },
  'equipment-parameter-controller': {
    'equipmentParameterUsingPost': {
      'url': '/api/equipmentParameter',
      'method': 'post'
    },
    'pageUsingGet': {
      'url': '/api/equipmentParameter/page',
      'method': 'get'
    },
    'equipmentDefinitionIdUsingGet': {
      'url': '/api/equipmentParameter/parameters/{equipmentDefinitionId}',
      'method': 'get'
    },
    'equipmentParameterIdUsingDelete': {
      'url': '/api/equipmentParameter/{equipmentParameterId}',
      'method': 'delete'
    }
  },
  'equipment-schedule-relevance-controller': {
    'equipmentScheduleRelevanceUsingPost': {
      'url': '/api/equipmentScheduleRelevance',
      'method': 'post'
    },
    'pageUsingGet': {
      'url': '/api/equipmentScheduleRelevance/page',
      'method': 'get'
    }
  },
  'grid-fs-controller': {
    'base64UsingGet': {
      'url': '/api/file/base64',
      'method': 'get'
    },
    'fileIdUsingGet': {
      'url': '/api/file/download/{fileId}',
      'method': 'get'
    },
    'uploadUsingPost': {
      'url': '/api/file/upload',
      'method': 'post'
    }
  },
  'gateway-controller': {
    'gatewayUsingPost': {
      'url': '/api/gateway',
      'method': 'post'
    },
    'isRepeatUsingGet': {
      'url': '/api/gateway/isRepeat',
      'method': 'get'
    },
    'pageUsingGet': {
      'url': '/api/gateway/page',
      'method': 'get'
    },
    'statusUpdateUsingPut': {
      'url': '/api/gateway/statusUpdate',
      'method': 'put'
    },
    'gatewayIdUsingGet': {
      'url': '/api/gateway/{gatewayId}',
      'method': 'get'
    }
  },
  'material-controller': {
    'createUsingPost': {
      'url': '/api/material/create',
      'method': 'post'
    },
    'isRepeatUsingGet': {
      'url': '/api/material/isRepeat',
      'method': 'get'
    },
    'pageUsingGet': {
      'url': '/api/material/page',
      'method': 'get'
    },
    'updateUsingPut': {
      'url': '/api/material/update',
      'method': 'put'
    },
    'idUsingGet': {
      'url': '/api/material/{id}',
      'method': 'get'
    },
    'materialIdUsingDelete': {
      'url': '/api/material/{materialId}',
      'method': 'delete'
    }
  },
  'material-definition-controller': {
    'activeOrDisableUsingGet': {
      'url': '/api/material/definition/activeOrDisable',
      'method': 'get'
    },
    'categoryUsingGet': {
      'url': '/api/material/definition/category',
      'method': 'get'
    },
    'createUsingPost': {
      'url': '/api/material/definition/create',
      'method': 'post'
    },
    'isRepeatUsingGet': {
      'url': '/api/material/definition/isRepeat',
      'method': 'get'
    },
    'updateUsingPut': {
      'url': '/api/material/definition/update',
      'method': 'put'
    },
    'idUsingGet': {
      'url': '/api/material/definition/{id}',
      'method': 'get'
    }
  },
  'material-input-output-controller': {
    'createUsingPost': {
      'url': '/api/material/inputOutput/create',
      'method': 'post'
    },
    'snapshotUsingGet': {
      'url': '/api/material/inputOutput/snapshot',
      'method': 'get'
    },
    'updateUsingPut': {
      'url': '/api/material/inputOutput/update',
      'method': 'put'
    },
    'materialInputOutputIdUsingDelete': {
      'url': '/api/material/inputOutput/{materialInputOutputId}',
      'method': 'delete'
    }
  },
  'material-repository-controller': {
    'activeOrDisableUsingGet': {
      'url': '/api/material/repository/activeOrDisable',
      'method': 'get'
    },
    'createUsingPost': {
      'url': '/api/material/repository/create',
      'method': 'post'
    },
    'pageUsingGet': {
      'url': '/api/material/repository/page',
      'method': 'get'
    },
    'updateUsingPut': {
      'url': '/api/material/repository/update',
      'method': 'put'
    },
    'idUsingGet': {
      'url': '/api/material/repository/{id}',
      'method': 'get'
    }
  },
  'process-route-controller': {
    'activeOrDisableUsingGet': {
      'url': '/api/process/route/activeOrDisable',
      'method': 'get'
    },
    'categoryUsingGet': {
      'url': '/api/process/route/category',
      'method': 'get'
    },
    'createUsingPost': {
      'url': '/api/process/route/create',
      'method': 'post'
    },
    'isRepeatUsingGet': {
      'url': '/api/process/route/isRepeat',
      'method': 'get'
    },
    'updateUsingPut': {
      'url': '/api/process/route/update',
      'method': 'put'
    },
    'idUsingGet': {
      'url': '/api/process/route/{id}',
      'method': 'get'
    }
  },
  'process-step-controller': {
    'activeOrDisableUsingGet': {
      'url': '/api/process/step/activeOrDisable',
      'method': 'get'
    },
    'createUsingPost': {
      'url': '/api/process/step/create',
      'method': 'post'
    },
    'isRepeatUsingGet': {
      'url': '/api/process/step/isRepeat',
      'method': 'get'
    },
    'pageUsingGet': {
      'url': '/api/process/step/page',
      'method': 'get'
    },
    'updateUsingPut': {
      'url': '/api/process/step/update',
      'method': 'put'
    },
    'idUsingGet': {
      'url': '/api/process/step/{id}',
      'method': 'get'
    }
  },
  'process-step-snapshot-controller': {
    'createUsingPost': {
      'url': '/api/process/stepSnapshot/create',
      'method': 'post'
    },
    'routeIdUsingGet': {
      'url': '/api/process/stepSnapshot/routeId',
      'method': 'get'
    },
    'updateUsingPut': {
      'url': '/api/process/stepSnapshot/update',
      'method': 'put'
    },
    'processStepSnapshootIdUsingDelete': {
      'url': '/api/process/stepSnapshot/{processStepSnapshootId}',
      'method': 'delete'
    }
  },
  'product-definition-controller': {
    'activeOrDisableUsingGet': {
      'url': '/api/product/activeOrDisable',
      'method': 'get'
    },
    'categoryUsingGet': {
      'url': '/api/product/category',
      'method': 'get'
    },
    'createUsingPost': {
      'url': '/api/product/create',
      'method': 'post'
    },
    'updateUsingPut': {
      'url': '/api/product/update',
      'method': 'put'
    },
    'idUsingGet': {
      'url': '/api/product/{id}',
      'method': 'get'
    }
  },
  'supplier-controller': {
    'supplierUsingPost': {
      'url': '/api/supplier',
      'method': 'post'
    },
    'isRepeatUsingGet': {
      'url': '/api/supplier/isRepeat',
      'method': 'get'
    },
    'pageUsingGet': {
      'url': '/api/supplier/page',
      'method': 'get'
    },
    'statusUpdateUsingPut': {
      'url': '/api/supplier/statusUpdate',
      'method': 'put'
    },
    'supplierIdUsingGet': {
      'url': '/api/supplier/{supplierId}',
      'method': 'get'
    }
  },
  'working-center-controller': {
    'workingCenterUsingPost': {
      'url': '/api/workingCenter',
      'method': 'post'
    },
    'getListUsingGet': {
      'url': '/api/workingCenter/getList',
      'method': 'get'
    },
    'isRepeatUsingGet': {
      'url': '/api/workingCenter/isRepeat',
      'method': 'get'
    },
    'pageUsingGet': {
      'url': '/api/workingCenter/page',
      'method': 'get'
    },
    'statusUpdateUsingPut': {
      'url': '/api/workingCenter/statusUpdate',
      'method': 'put'
    },
    'centerIdUsingGet': {
      'url': '/api/workingCenter/{centerId}',
      'method': 'get'
    }
  },
  'working-center-relevance-controller': {
    'workingCenterRelevanceUsingPut': {
      'url': '/api/workingCenterRelevance',
      'method': 'put'
    },
    'pageUsingGet': {
      'url': '/api/workingCenterRelevance/page',
      'method': 'get'
    },
    'workingCenterRelevanceIdUsingDelete': {
      'url': '/api/workingCenterRelevance/{workingCenterRelevanceId}',
      'method': 'delete'
    }
  },
  'working-shift-controller': {
    'workingShiftUsingPost': {
      'url': '/api/workingShift',
      'method': 'post'
    },
    'isRepeatUsingGet': {
      'url': '/api/workingShift/isRepeat',
      'method': 'get'
    },
    'pageUsingGet': {
      'url': '/api/workingShift/page',
      'method': 'get'
    },
    'statusUpdateUsingPut': {
      'url': '/api/workingShift/statusUpdate',
      'method': 'put'
    },
    'shiftIdUsingGet': {
      'url': '/api/workingShift/{shiftId}',
      'method': 'get'
    }
  },
  'task-manage-controller': {
    'jobGroupUsingPost': {
      'url': '/task/resume/{jobName}/{jobGroup}',
      'method': 'post'
    },
    'listUsingGet': {
      'url': '/task/list',
      'method': 'get'
    },
    'saveUsingPost': {
      'url': '/task/save',
      'method': 'post'
    }
  }
}
