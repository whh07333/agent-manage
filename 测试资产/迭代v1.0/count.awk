/^###/ { 
    gsub(/^### /, "", module);
    current_module = module;
}
/^.*\|\s*[A-Z][A-Z]-[0-9][0-9][0-9]*\s*\|/ { 
    count[current_module]++; 
    total++; 
}
END {
    print "| 模块名称 | 缩写 | 测试用例数 |";
    print "|----------|------|-----------|";
    for (m in count) {
        split(m, a, "/");
        name = a[2];
        abbr = substr(name, 1, 2);
        printf "| %s | %s | %d |\n", name, abbr, count[m];
    }
    print "|----------|------|-----------|";
    print "| **总计** | - | **" total "** |";
}
