# OSI Game Functions

All the game functions available to the OSI scripting engine.


# Notes

These repository contains a JSON file, `gamefunctions.json`, describing all the game functions exposed to the OSI.


# Schema

- `<NAMESPACE>`: Namespace name
- `<FUNCTION>`: Function name
- `<VERSION>`: Array of implementations for the name by version (duplicates possible)
- `address`: Hex encoded address of the the implementation subroutine
- `argc`: The min and max allowed arguments (`0`-`10`)
  - `0`: Minimum arguments
  - `1`: Maximum arguments
- `argt`: Argument types (always 10, unlisted ones beyond maximum arguments are type `15`):
  - `0`: Type:
    - `String`: Dynamically generated variant type
    - `Integer`: Variant type
  - `1`: Subtype:
    - `String`: The subtype it contains
    - `null`: Nothing specified

```json
{
	"<NAMESPACE>": {
		"info": "<info on this namespace>",
		"functions": {
			"<FUNCTION>": {
				"info": "<info on this function>",
				"versions": {
					"<VERSION>": [
						{
							"address": "424242",
							"argc": [
								2,
								3
							],
							"argt": [
								[
									16,
									null
								],
								[
									"SomeDynamiclyGeneratedGameType",
									null
								],
								[
									16,
									"some_type"
								]
							]
						}
					]
				}
			}
		}
	}
}
```


# Bugs

If you find a mistake, please open a ticket under issues section for this repository.


# License

Copyright (c) 2018 JrMasterModelBuilder

Licensed under the Mozilla Public License, v. 2.0
