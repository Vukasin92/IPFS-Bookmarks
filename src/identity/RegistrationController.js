import {container, TYPES} from '../inversify.config'
import FileSystemFactory from '../io/FileSystemFactory';

export default class RegistrationController {
    constructor(storageType){
        this.storageType = storageType;
        this.fileSystemProvider = FileSystemFactory.createFileSystemProvider(storageType);
        this.encryptor = container.get(TYPES.Encryptor);
    }

    register(username, password) {
        try {
            var fileName = this.fileSystemProvider.getUniqueFileNameForUser(username);
            var encryptionKey = this.encryptor.generateEncryptionKey(username, password);
            var usernameHash = this.encryptor.getDeterministicHash(username);
    
            // TODO: Perhaps leave failing to createFileWithContent method, it has to fail anyway.
            // TODO: use abstraction for writing, to have concurrent reads (collaborative editing).
            var encryptedFileContent = this.encryptor.encrypt(usernameHash, encryptionKey);
            this.fileSystemProvider.createFileWithContent(encryptedFileContent + '<HEADER_END>', fileName /* destinationPath */);
        }
        catch (error) {
            throw new Error("User already exists.");
        }
    }
}