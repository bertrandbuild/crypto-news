// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "node_modules/@tableland/evm/contracts/interfaces/ITablelandTables.sol";
import "node_modules/@tableland/evm/contracts/utils/TablelandDeployments.sol";
import {SQLHelpers} from "node_modules/@tableland/evm/contracts/utils/SQLHelpers.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract FileStorage {
    struct FileInfo {
        uint256 fileId;
        string transcriptCid;
        string analysisCid;
        address payable firstUser;
    }
    //Tabla to store data about uploaded files
    ITablelandTables private _tableland;

    // Fee for accessing the information
    uint256 public fee;
    uint256 private _tableId; // Unique table ID
    string private constant _TABLE_PREFIX = "cn_table"; // Custom table prefix

    // Mapping to store FileInfo structs
    mapping(uint256 => FileInfo) public fileInfoMap;


    // Event to emit when a file is added
    event FileAdded(uint256 indexed fileId, string transcriptCid, string analysisCid, address firstUser);

    // Event to emit when file info is accessed
    event FileInfoAccessed(uint256 indexed fileId, string transcriptCid, string analysisCid, address accessedBy);

    // Constructor to set the initial fee and creates a simple table 
    constructor(uint256 _fee) {
        fee = _fee *10**18;
        // Crear una tabla
        _tableId = TablelandDeployments.get().create(
            address(this),
            SQLHelpers.toCreateFromSchema(
                "fileId integer,"
                "transcriptCid text,"
                "analysisCid text",
                 _TABLE_PREFIX)
        );
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

        this.insertIntoTable(fileId, transcriptCid, analysisCid);

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

    
    function insertIntoTable(uint256 _fileId, string memory _transcriptCid, string memory _analysisCid) external {
        TablelandDeployments.get().mutate(
            address(this), // Table owner, i.e., this contract
            _tableId,
            SQLHelpers.toInsert(
                _TABLE_PREFIX,
                _tableId,
                "id,_fileId,_transcriptCid,_analysisCid",
                string.concat(
                    Strings.toString(_fileId),// Convert to a string
                    ",",
                    SQLHelpers.quote(_transcriptCid),// Wrap strings in single quotes with the `quote` method
                    ",",
                    SQLHelpers.quote(_analysisCid)
                )
            )
        );
    }
    
    // Update only the row that the caller inserted
    function updateTable(uint256 _fileId, string memory _transcriptCid, string memory _analysisCid) external {
        // Set the values to update
        string memory setters = string.concat(
            ",transcriptCid=", SQLHelpers.quote(_transcriptCid),
            ",analysisCid=", SQLHelpers.quote(_analysisCid)
        );
        // Specify filters for which row to update
        string memory filters = string.concat(
            "id=", Strings.toString(_fileId)
        );
        // Mutate a row at `id` with new values
        TablelandDeployments.get().mutate(
            address(this),
            _tableId,
            SQLHelpers.toUpdate(_TABLE_PREFIX, _tableId, setters, filters)
        );
    } 

    // Delete a row from the table by ID
    function deleteFromTable(uint256 _fileId) external {
        // Specify filters for which row to delete
        string memory filters = string.concat(
            "id=",
            Strings.toString(_fileId)
        );
        // Mutate a row at `id`
        TablelandDeployments.get().mutate(
            address(this),
            _tableId,
            SQLHelpers.toDelete(_TABLE_PREFIX, _tableId, filters)
        );
    }


    // Set the ACL controller to enable row-level writes with dynamic policies
    function setAccessControl(address controller) external {
        TablelandDeployments.get().setController(
            address(this), // Table owner, i.e., this contract
            _tableId,
            controller // Set the controller address—a separate controller contract
        );
    }

    // Return the table ID
    function getTableId() external view returns (uint256) {
        return _tableId;
    }

    // Return the table name
    function getTableName() external view returns (string memory) {
        return SQLHelpers.toNameFromId(_TABLE_PREFIX, _tableId);
    }
}
