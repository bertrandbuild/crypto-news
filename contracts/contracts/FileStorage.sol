// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract FileStorage is Ownable {
    struct FileInfo {
        uint256 fileId;
        string transcriptCid;
        string analysisCid;
        address fileOwner;
    }

    // Fee for accessing the information
    uint256 public fee;

    // Mapping to store FileInfo
    mapping(uint256 fileId => FileInfo file) public filesMap;

    // Event to emit when a file is added
    event FileAdded(FileInfo file);

    // Event to emit when file info is accessed
    event FileInfoAccessed(address accessedBy, FileInfo file);
    event FeeUpdated(uint256 newFee);

    error ExistentFile(address fileOwner, uint256 fileId);
    error OnlyOwner(address owner);
    error IncorrectFee(uint256 fee);
    error FileDoesNotExist(uint256 fileId);
    error InvalidNewFee(uint256 newFee);

    // Mapping to store the file info
    mapping(uint256 fileId => FileInfo) public fileInfoMap;

    // Function to set the initial fee
    function setFee(uint256 _fee) public {
        fee = _fee;
    }

    // Constructor to set the initial fee
    constructor(uint256 _fee) Ownable(msg.sender) {
        fee = _fee;
    }

    /**
     * @dev Function to upload file information.
     * @param _fileId The file ID.
     * @param _transcriptCid The transcript reference.
     * @param _analysisCid The analysis reference.
     * emits FileAdded event.
     */
    function addFile(
        uint256 _fileId,
        string memory _transcriptCid,
        string memory _analysisCid
    ) public {
        if (filesMap[_fileId].fileId != 0) revert ExistentFile(msg.sender, _fileId);

        FileInfo memory _newFile = FileInfo({
            fileId: _fileId,
            transcriptCid: _transcriptCid,
            analysisCid: _analysisCid,
            fileOwner: msg.sender
        });
        filesMap[_fileId] = _newFile;

        emit FileAdded(_newFile);
    }

    /**
     * @dev Function to access file information.
     *     If the caller is not the file owner needs to pay a fee.
     * @param _fileId The file ID.
     * emits FileInfoAccessed event.
     */
    function getFile(uint256 _fileId) public payable {
        FileInfo memory _fileInfo = fileInfoMap[_fileId];
        if (_fileInfo.fileId == 0) revert FileDoesNotExist(_fileId);
        if (msg.sender != _fileInfo.fileOwner) {
            uint256 _fee = fee;
            if (msg.value != _fee) revert IncorrectFee(_fee);
        }

        payable(_fileInfo.fileOwner).transfer(msg.value);

        emit FileInfoAccessed(msg.sender, _fileInfo);
    }

    /**
     * @dev Function to update the fee.
     * @param _newFee The new fee.
     * emits FeeUpdated event.
     */
    function updateFee(uint256 _newFee) public onlyOwner {
        // This could have access control to restrict who can update the fee
        uint256 _oldFee = fee;
        // todo think on some restrictions to make it more fair
        // ! ex newFee > oldFee
        if (_newFee == 0 || _newFee == _oldFee) revert InvalidNewFee(_newFee);
        fee = _newFee;
        emit FeeUpdated(_newFee);
    }

    // ! IDEAS
    //! - the owner of the file is free to change the file price
    //!                    (there is a minimum/maximum price and the file Owner is free to specify the file price)
    //! - be able to make a file public for specific users (have like a white list of users that can access the file)
    //! - files could have a price for renting(single access) and another for buying (multiple access)
}
