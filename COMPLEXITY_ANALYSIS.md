# Complexity Analysis

## 1. Add Expense

The expense is appended to a Python list.

- **Time Complexity:** O(1) amortized
- **Worst-Case Time Complexity:** O(n) when the list needs to resize
- **Space Complexity:** O(1) auxiliary space per insertion, excluding occasional list resizing

## 2. Get Total Expense

The program visits every expense and adds its amount.

- **Time Complexity:** O(n)
- **Auxiliary Space Complexity:** O(1)

## 3. Search by Category

The program checks each expense category.

- **Time Complexity:** O(n)
- **Space Complexity:** O(k), where k is the number of matching expenses returned

## 4. Filter by Minimum Amount

The program checks every expense against the minimum amount.

- **Time Complexity:** O(n)
- **Space Complexity:** O(k), where k is the number of matching expenses returned

## 5. Spending by Category

The program traverses all expenses and stores category totals in a dictionary.

- **Expected Time Complexity:** O(n), assuming average-case constant-time dictionary operations
- **Space Complexity:** O(c), where c is the number of distinct categories

## 6. Highest Spending Category

The program calculates category totals and finds the category with the maximum spending.

- **Expected Time Complexity:** O(n + c)
- **Space Complexity:** O(c)

## 7. Average Expense

The program calculates the total expense and divides it by the number of expenses.

- **Time Complexity:** O(n)
- **Auxiliary Space Complexity:** O(1)

## 8. Async File Processing

Multiple files are processed concurrently using asyncio and threads.

The approach is suitable for I/O-bound operations because file operations can overlap while waiting for I/O.

The actual performance improvement depends on file sizes, system resources, and I/O delays.

## 9. Algorithm Selection

The project uses list traversal, dictionary aggregation, filtering, and maximum-value selection because these operations directly support expense management and analysis.

Divide-and-conquer, dynamic programming, greedy algorithms, backtracking, and branch-and-bound are not necessary for the current requirements. They should only be introduced if a suitable problem arises.

## 10. Amortized and Expected Complexity

**Amortized complexity:** Appending an expense to a Python list is O(1) amortized because occasional resizing costs are spread across multiple insertions.

**Expected complexity:** Dictionary-based category aggregation is expected O(n) under typical hash-table assumptions. In pathological collision cases, dictionary operations can take longer.

## Overall

Most expense analysis operations run in O(n) expected or worst-case time, depending on the operation and its data structure assumptions. Category analysis uses O(c) additional space, while total and average calculations use O(1) auxiliary space.
