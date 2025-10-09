const permissions = {
  editor: ['addNotes', 'getNotes', 'getAllNotes', 'updateNotes'],
  user: ['deleteNotes', 'addNotes', 'getNotes', 'getAllNotes', 'updateNotes'],
  admin: ['addContributor', 'removeContributor', 'addNotes', 'getNotes', 'getAllNotes', 'updateNotes', 'deleteNotes'],
  viewer: ['getNotes', 'getAllNotes']
};

export default permissions;
