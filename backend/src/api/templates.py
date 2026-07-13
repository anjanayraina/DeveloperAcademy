"""
Code Template API — serves starter code files to the frontend.
Templates are stored as inline strings for the MVP; move to disk/DB later.
"""
from typing import List
from fastapi import APIRouter, HTTPException
from src.models.templates import TemplateMetadata, CodeTemplate

router = APIRouter()


_TEMPLATES: dict[str, CodeTemplate] = {
    "erc20-basic": CodeTemplate(
        id="erc20-basic",
        title="Basic ERC-20 Token",
        description="A minimal ERC-20 token implementation using OpenZeppelin.",
        language="solidity",
        level_id=3,
        tags=["erc20", "token", "openzeppelin"],
        code="""// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AcademyToken
 * @dev A basic ERC-20 token for learning purposes.
 *      Level 3 — Smart Contract Development
 */
contract AcademyToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18;

    constructor(address initialOwner)
        ERC20("AcademyToken", "ACT")
        Ownable(initialOwner)
    {}

    /// @notice Mint new tokens. Only the owner may call this.
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    /// @notice Burn tokens from the caller's balance.
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
""",
    ),
    "simple-storage": CodeTemplate(
        id="simple-storage",
        title="Simple Storage Contract",
        description="A beginner-friendly contract that stores and retrieves a value.",
        language="solidity",
        level_id=3,
        tags=["storage", "beginner", "state-variables"],
        code="""// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleStorage
 * @dev Demonstrates state variables, getters, and setters.
 *      Level 3 — Smart Contract Development
 */
contract SimpleStorage {
    uint256 private storedValue;

    event ValueChanged(address indexed caller, uint256 newValue);

    /// @notice Store a new value.
    function set(uint256 _value) external {
        storedValue = _value;
        emit ValueChanged(msg.sender, _value);
    }

    /// @notice Retrieve the stored value.
    function get() external view returns (uint256) {
        return storedValue;
    }
}
""",
    ),
    "defi-vault": CodeTemplate(
        id="defi-vault",
        title="Basic DeFi Vault",
        description="A yield vault pattern: deposit ERC-20, receive shares.",
        language="solidity",
        level_id=4,
        tags=["defi", "vault", "erc4626", "yield"],
        code="""// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AcademyVault
 * @dev Minimal ERC-4626 vault for DeFi learning.
 *      Level 4 — DeFi Fundamentals
 */
contract AcademyVault is ERC4626, Ownable {
    constructor(IERC20 asset_, address initialOwner)
        ERC20("AcademyVault Share", "avACT")
        ERC4626(asset_)
        Ownable(initialOwner)
    {}

    /// @dev Optional: override to add yield strategy logic here.
    function totalAssets() public view override returns (uint256) {
        return super.totalAssets();
    }
}
""",
    ),
    "dao-governor": CodeTemplate(
        id="dao-governor",
        title="DAO Governor Contract",
        description="A basic OpenZeppelin Governor for on-chain voting.",
        language="solidity",
        level_id=5,
        tags=["dao", "governance", "voting", "openzeppelin"],
        code="""// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";

/**
 * @title AcademyDAO
 * @dev Minimal Governor for DAO learning.
 *      Level 5 — DAO Governance
 */
contract AcademyDAO is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes
{
    constructor(IVotes _token)
        Governor("AcademyDAO")
        GovernorSettings(
            7200,    /* voting delay (1 day in blocks) */
            50400,   /* voting period (1 week) */
            0        /* proposal threshold */
        )
        GovernorVotes(_token)
    {}

    function quorum(uint256) public pure override returns (uint256) {
        return 4e18; // 4 tokens
    }

    function votingDelay() public view override(Governor, GovernorSettings)
        returns (uint256) { return super.votingDelay(); }

    function votingPeriod() public view override(Governor, GovernorSettings)
        returns (uint256) { return super.votingPeriod(); }

    function proposalThreshold() public view override(Governor, GovernorSettings)
        returns (uint256) { return super.proposalThreshold(); }
}
""",
    ),
}


# ─── Endpoints ────────────────────────────────────────────────────────────────
@router.get("", response_model=List[TemplateMetadata])
async def list_templates(level_id: int | None = None):
    """List all available code templates, optionally filtered by level."""
    templates = list(_TEMPLATES.values())
    if level_id is not None:
        templates = [t for t in templates if t.level_id == level_id]
    return templates


@router.get("/{template_id}", response_model=CodeTemplate)
async def get_template(template_id: str):
    """Retrieve a specific template including its full source code."""
    if template_id not in _TEMPLATES:
        raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")
    return _TEMPLATES[template_id]
