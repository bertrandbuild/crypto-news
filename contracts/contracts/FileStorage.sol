// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {
    struct FileInfo {
        uint256 fileId;
        string transcriptCid;
        string analysisCid;
        address payable firstUser;
    }

    // Fee for accessing the information
    uint256 public fee;

    // Mapping to store FileInfo structs
    mapping(uint256 => FileInfo) public fileInfoMap;

    // Event to emit when a file is added
    event FileAdded(uint256 indexed fileId, string transcriptCid, string analysisCid, address firstUser);

    // Event to emit when file info is accessed
    event FileInfoAccessed(uint256 indexed fileId, string transcriptCid, string analysisCid, address accessedBy);

    // Constructor to set the initial fee
    constructor(uint256 _fee) {
        fee = _fee;
    }

    // Function to upload file information
    function addFile(uint256 fileId, string memory transcriptCid, string memory analysisCid) public {
        require(bytes(fileInfoMap[fileId].transcriptCid).length == 0, "File already exists.");
        fileInfoMap[fileId] = FileInfo({
            fileId: fileId,
            transcriptCid: transcriptCid,
            analysisCid: analysisCid,
            firstUser: payable(msg.sender)
        });
        emit FileAdded(fileId, transcriptCid, analysisCid, msg.sender);
    }

    // Function for users to access file information after paying a fee
    
    function getFile(uint256 fileId) public payable {
        require(msg.value == fee, "Incorrect fee."); // Direct comparison
        FileInfo storage fileInfo = fileInfoMap[fileId];
        require(bytes(fileInfo.transcriptCid).length > 0, "File does not exist.");

        fileInfo.firstUser.transfer(msg.value);

        emit FileInfoAccessed(fileId, fileInfo.transcriptCid, fileInfo.analysisCid, msg.sender);
    }

    // Function to update the fee
    function updateFee(uint256 _newFee) public {
        // This could have access control to restrict who can update the fee
        fee = _newFee;
    }
}
