# Copyright (C) 2012-2022 Zammad Foundation, https://zammad-foundation.org/

class FormUpdater::Updater::Organization::Edit < FormUpdater::Updater
  include FormUpdater::Concerns::ChecksCoreWorkflow

  core_workflow_screen 'edit'

  def object_type
    ::Organization
  end
end
