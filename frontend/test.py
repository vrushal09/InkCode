rows = 5

# Upper Half
for i in range(1, rows + 1):
    # Print spaces
    print(" " * (rows - i), end="")
    
    # Print numbers with *
    for j in range(1, i + 1):
        print(j, end="")
        if j != i:
            print("*", end="")
    print()

# Lower Half
for i in range(rows - 1, 0, -1):
    # Print spaces
    print(" " * (rows - i), end="")
    
    # Print numbers with *
    for j in range(1, i + 1):
        print(j, end="")
        if j != i:
            print("*", end="")
    print()
#