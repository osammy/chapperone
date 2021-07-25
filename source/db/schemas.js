// Define your models and their properties
const ChatUserSchema = {
  name: 'ChatUser',
  properties: {
    _id: 'string',
    name: 'string',
    avatar: 'string?',
  },
};

const ChatsSchema = {
  name: 'Chats',
  properties: {
    id_key: {type: 'string', index: true}, //This is how we will locate each data for each chat
    _id: {type: 'string', index: true, unique: true}, //unique chat message id, as msgId from fiorebase
    text: 'string',
    type: {type: 'string', index: true},
    firebase_key: 'string',
    trip_id: {type: 'string', index: true},
    sender_id: {type: 'string', index: true},
    receiver_id: {type: 'string', index: true},
    createdAt: 'double',
    user: 'ChatUser',
    status: 'string',
    image: 'string?',
    imageLocalPath: 'string?',
  },
};

const ChatsListSchema = {
  name: 'ChatsList',
  properties: {
    _id: {type: 'string', unique: true},
    id_key: {type: 'string', index: true},
    role: 'string',
    avatar: 'string',
    first_name: 'string',
    last_name: 'string',
    createdAt: 'double',
    lastMessage: 'string',
    email: 'string',
    unread_count: 'int',
    msgId: {type: 'string', unique: true},
  },
};

const NotificationsSchema = {
  name: 'Notifications',
  properties: {
    _id: {type: 'string', unique: true},
    type: 'string',
    title: 'string',
    linkTo: 'string?',
    linkId: 'string?',
    read: 'bool',
    sender_id: 'string?',
    receiver_id: 'string?',
    senderName: 'string?',
    receiver: 'string?',
    text: 'string',
    createdAt: 'double',
  },
};

const schemaVersion = 0.3;

export default {
  ChatsSchema,
  ChatsListSchema,
  ChatUserSchema,
  NotificationsSchema,
  schemaVersion,
};
